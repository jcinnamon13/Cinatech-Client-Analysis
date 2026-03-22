import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '../lib/ai/prompts';
import fs from 'fs';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testRaw() {
    const docText = `Company Name: Ideal Chiropractic\nLocation: London, UK\nGoal: We want 20 more new patients a month.`;
    console.log('Sending request to Claude...');

    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 8192,
            temperature: 0.2,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: `Analyze the following client onboarding document text and return the structured JSON object as instructed:\n\n<document>\n${docText}\n</document>`
                }
            ]
        });

        const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
        fs.writeFileSync('raw-claude-output.txt', responseText);
        console.log('Saved raw output to raw-claude-output.txt');

        // Search for the start of the JSON object containing the expected keys
        const firstBracket = responseText.search(/\{\s*"(?:pillars|priority_action_plan)"/);
        const lastBracket = responseText.lastIndexOf('}');
        console.log('firstBracket:', firstBracket, 'lastBracket:', lastBracket);

    } catch (err: any) {
        console.error('Claude API Error caught:', err);
    }
}

testRaw().catch(console.error);
