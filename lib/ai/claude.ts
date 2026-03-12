import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, SUMMARY_PROMPT } from './prompts';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyseDocument(textStructure: string) {
    try {
        // Only strictly truncate if the file is absurdly massive (e.g. >100k chars ~25k tokens)
        // Haiku is fast enough to process this volume quickly.
        const safeTextStructure = textStructure.length > 100000
            ? textStructure.substring(0, 100000) + "\n...[CONTENT TRUNCATED FOR LENGTH]..."
            : textStructure;

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 8192,
            temperature: 0.2, // Low temperature for consistent JSON structure
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze the following client onboarding document text and return the structured JSON array as instructed:\n\n<document>\n${safeTextStructure}\n</document>`
                        }
                    ]
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

        // Sometimes Claude adds markdown JSON block or conversational text despite instructions.
        // We find the first '[' and last ']' to isolate the JSON array.
        let cleanJson = responseText;
        const firstBracket = responseText.indexOf('[');
        const lastBracket = responseText.lastIndexOf(']');

        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            cleanJson = responseText.substring(firstBracket, lastBracket + 1);
        } else {
            // Fallback: just strip markdown blocks if brackets aren't found
            cleanJson = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        }

        let structuredResult;
        try {
            structuredResult = JSON.parse(cleanJson);
        } catch (error) {
            console.error('Failed to parse Claude JSON output:', cleanJson);
            throw new Error('Claude returned invalid JSON format: ' + (error instanceof Error ? error.message : String(error)));
        }

        // Secondary call for the Executive Summary
        const summaryResponse = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 500,
            temperature: 0.5,
            system: "You are an elite senior business consultant writing a summary for an agency.",
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Here is the structured analysis of a new client. ${SUMMARY_PROMPT}\n\n<analysis>\n${JSON.stringify(structuredResult, null, 2)}\n</analysis>`
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
        console.error('Claude API Error:', error);
        throw error;
    }
}
