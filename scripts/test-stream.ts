import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '../lib/ai/prompts';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testStream() {
    const docText = `
    Company Name: Ideal Chiropractic
    Location: London, UK
    Goal: We want 20 more new patients a month. We currently get patients from word of mouth. Our website just has an online booking tool but no real marketing.
    `;

    console.log('Sending streaming request to Claude...');
    const stream = await anthropic.messages.create({
        model: 'claude-sonnet-4-6', // Make sure this matches the actual valid model name
        max_tokens: 8192,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        stream: true,
        messages: [
            {
                role: 'user',
                content: `Analyze the following client onboarding document text and return the structured JSON object as instructed:\n\n<document>\n${docText}\n</document>`
            }
        ]
    });

    for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            process.stdout.write(chunk.delta.text);
        }
    }
    console.log('\nStream complete.');
}

testStream().catch(console.error);
