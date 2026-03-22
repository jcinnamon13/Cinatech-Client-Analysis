import { NextRequest, NextResponse } from 'next/server';
import { processAnalysis } from '@/lib/ai/process';

// We might want to allow this to run for a while if it's a large document
export const maxDuration = 180; // 3 minutes on Vercel Pro/Enterprise

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const documentId = params.id;

    if (!documentId) {
        return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
    }

    try {
        await processAnalysis(documentId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Analysis pipeline error:', error);
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}
