import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    try {
        const { analyseDocument } = await import('../lib/ai/claude.ts');
        console.log('Sending test request to Claude...');
        const docText = `
        Company Name: Ideal Chiropractic
        Location: London, UK
        Goal: We want 20 more new patients a month. We currently get patients from word of mouth. Our website just has an online booking tool but no real marketing.
        `;
        const result = await analyseDocument(docText);
        console.log('Success:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test script caught error:', error);
    }
}

test();
