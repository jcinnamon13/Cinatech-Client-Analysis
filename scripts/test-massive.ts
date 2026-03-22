import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testMassive() {
    const { analyseDocument } = await import('../lib/ai/claude');

    // Create a massive payload simulating a real 10-page document
    let docText = `Company Name: XCXC\nLocation: London, UK\nGoal: We want 20 more new patients a month.\n`;
    for (let i = 0; i < 50; i++) {
        docText += `Here is some extremely detailed historical context regarding our previous marketing efforts and why they failed completely. We tried Facebook ads, Google ads, TikTok, but absolutely nothing worked. We spent £50k. Patient acquisition cost was £1200. We need to lower it. We currently use Hubspot. Our sales team is 3 people. They take 5 days to call leads back. We have no show rate of 40%. Our LTV is £3000. Our margin is 45%.\n`;
    }

    console.log('Sending MASSIVE full analysis request to Claude via analyseDocument()...');

    try {
        const result = await analyseDocument(docText);
        console.log('✅ Analysis completed successfully!');
        console.log('Pillars count:', result.structuredResult.pillars?.length);
    } catch (err: any) {
        console.error('❌ Claude API Error caught:', err);
    }
}

testMassive().catch(console.error);
