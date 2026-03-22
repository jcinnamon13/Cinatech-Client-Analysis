import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testFull() {
    const { analyseDocument } = await import('../lib/ai/claude');
    const docText = `Company Name: XCXC\nLocation: London, UK\nGoal: We want 20 more new patients a month.`;
    console.log('Sending full analysis request to Claude via analyseDocument()...');

    try {
        const result = await analyseDocument(docText);
        console.log('✅ Analysis completed successfully!');
        console.log('Summary:', result.summary.substring(0, 100) + '...');
        console.log('Pillars count:', result.structuredResult.pillars?.length);
        console.log('Priority Action Plan:', result.structuredResult.priority_action_plan);
    } catch (err: any) {
        console.error('❌ Claude API Error caught:', err);
        if (err.message.includes('JSON')) {
            console.error('JSON Error identified.');
        }
    }
}

testFull().catch(console.error);
