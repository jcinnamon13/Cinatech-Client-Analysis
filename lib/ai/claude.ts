import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { SYSTEM_PROMPT, SUMMARY_PROMPT, METADATA_PROMPT } from './prompts';

export class DocumentTooLargeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DocumentTooLargeError';
    }
}

const GrowthStageAssessmentSchema = z.object({
    classified_stage: z.string(),
    signals: z.array(z.string()),
    crisis_status: z.string(),
    calibration_statement: z.string(),
});

const PillarSchema = z.object({
    question: z.string(),
    original_response: z.string(),
    improved_response: z.string(),
    recommendations: z.array(z.string()),
    flags: z.array(z.string()),
});

const PriorityActionSchema = z.object({
    action: z.string(),
    owner: z.string(),
    deadline: z.string(),
    pillar: z.string(),
    consequence: z.string(),
    time_horizon: z.string(),
});

const AnalysisOutputSchema = z.object({
    growth_stage_assessment: GrowthStageAssessmentSchema,
    pillars: z.array(PillarSchema),
    priority_action_plan: z.array(PriorityActionSchema),
});

const MetadataSchema = z.object({
    company_name: z.string().nullable(),
    individual_name: z.string().nullable(),
    job_title: z.string().nullable(),
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyseDocument(textStructure: string, imageDataUri?: string) {
    try {
        if (!imageDataUri) {
            const CHAR_LIMIT = 100_000;
            if (textStructure.length > CHAR_LIMIT) {
                const overage = textStructure.length - CHAR_LIMIT;
                throw new DocumentTooLargeError(
                    `Document too large to analyse: ${textStructure.length.toLocaleString()} characters ` +
                    `(${overage.toLocaleString()} over the ${CHAR_LIMIT.toLocaleString()} character limit). ` +
                    `Split the document into smaller sections or remove non-essential content before retrying.`
                );
            }
        }

        const userContent: Anthropic.MessageParam['content'] = imageDataUri
            ? (() => {
                const [header, base64Data] = imageDataUri.split(',');
                const mediaType = header.split(':')[1].split(';')[0] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
                return [
                    {
                        type: 'image' as const,
                        source: { type: 'base64' as const, media_type: mediaType, data: base64Data },
                    },
                    {
                        type: 'text' as const,
                        text: 'Analyse the client onboarding document shown in this image and return the structured JSON array as instructed.',
                    },
                ];
            })()
            : [
                {
                    type: 'text' as const,
                    text: `Analyse the following client onboarding document text and return the structured JSON array as instructed:\n\n<document>\n${textStructure}\n</document>`,
                },
            ];

        const response = await anthropic.messages.parse({
            model: 'claude-opus-4-6',
            max_tokens: 24000,
            thinking: { type: 'adaptive' },
            system: [
                {
                    type: 'text' as const,
                    text: SYSTEM_PROMPT,
                    cache_control: { type: 'ephemeral' as const },
                }
            ],
            messages: [
                {
                    role: 'user',
                    content: userContent,
                }
            ],
            output_config: {
                format: zodOutputFormat(AnalysisOutputSchema),
            },
        });

        if (response.stop_reason === 'max_tokens') {
            throw new Error('Analysis output was truncated before completion. Increase max_tokens or reduce document length.');
        }
        if (response.stop_reason === 'refusal') {
            throw new Error('Claude refused to analyse this document. Review content for policy violations.');
        }

        const structuredResult = response.parsed_output;

        // Secondary call for the Executive Summary
        const summaryResponse = await anthropic.messages.create({
            model: 'claude-opus-4-6',
            max_tokens: 500,
            temperature: 0.5,
            system: "You are an elite senior business consultant writing a summary for an agency.",
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Here is the structured analysis of a new client.${SUMMARY_PROMPT}\n\n<analysis>\n${JSON.stringify(structuredResult, null, 2)}\n </analysis>`
                        }
                    ]
                }
            ]
        });

        const summary = summaryResponse.content[0].type === 'text' ? summaryResponse.content[0].text : '';

        return {
            structuredResult,
            summary
        };

    } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
            console.error('Claude API rate limit exceeded — retry after backoff:', error.message);
        } else if (error instanceof Anthropic.BadRequestError) {
            console.error('Claude API bad request — check input content:', error.message);
        } else if (error instanceof Anthropic.APIError) {
            console.error(`Claude API error (status ${error.status}):`, error.message);
        } else {
            console.error('Claude API Error:', error);
        }
        throw error;
    }
}

export interface DocumentMetadata {
    company_name: string | null;
    individual_name: string | null;
    job_title: string | null;
}

/**
 * Lightweight Claude call to extract company name, individual name, and job title.
 * Never throws — returns nulls for any field that can't be found.
 */
export async function extractMetadata(textContent: string): Promise<DocumentMetadata> {
    const fallback: DocumentMetadata = { company_name: null, individual_name: null, job_title: null };
    try {
        const safeText = textContent.length > 20000
            ? textContent.substring(0, 20000) + '\n...[TRUNCATED]'
            : textContent;

        const response = await anthropic.messages.parse({
            model: 'claude-haiku-4-5',
            max_tokens: 256,
            temperature: 0,
            messages: [
                {
                    role: 'user',
                    content: `${METADATA_PROMPT}\n\n<document>\n${safeText}\n</document>`
                }
            ],
            output_config: {
                format: zodOutputFormat(MetadataSchema),
            },
        });

        if (response.stop_reason === 'max_tokens') {
            throw new Error('Metadata extraction was truncated.');
        }
        if (response.stop_reason === 'refusal') {
            throw new Error('Claude refused to extract metadata from this document.');
        }

        return {
            company_name: response.parsed_output?.company_name ?? null,
            individual_name: response.parsed_output?.individual_name ?? null,
            job_title: response.parsed_output?.job_title ?? null,
        };
    } catch (err) {
        console.warn('extractMetadata failed, returning nulls:', err);
        return fallback;
    }
}

