import { createServiceClient } from '@/lib/supabase/server';
import { parsePdf } from '@/lib/parsers/pdf';
import { parseDocx } from '@/lib/parsers/docx';
import { parseCsv } from '@/lib/parsers/csv';
import { analyseDocument, extractMetadata } from '@/lib/ai/claude';
import { parseImage } from '@/lib/parsers/image';
import { Resend } from 'resend';
import { cleanSummary } from '@/lib/utils';

export async function processAnalysis(documentId: string) {
    if (!documentId) throw new Error('Missing document ID');

    try {
        const supabase = await createServiceClient();

        // 1. Fetch Document Details
        const { data: document, error: docErr } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .single();

        if (docErr || !document) throw new Error(`Document not found: ${docErr?.message}`);

        // Update status to analysing
        await supabase.from('documents').update({ status: 'analysing' }).eq('id', documentId);

        // 2. Download File from Storage
        const { data: fileData, error: downloadErr } = await supabase.storage
            .from('documents')
            .download(document.file_path);

        if (downloadErr) throw new Error(`Download failed: ${downloadErr.message}`);

        const buffer = Buffer.from(await fileData.arrayBuffer());
        let textContent = '';
        let imageDataUri: string | undefined;

        // 3. Parse File
        if (document.file_type === 'pdf') {
            textContent = await parsePdf(buffer);
        } else if (document.file_type === 'docx') {
            textContent = await parseDocx(buffer);
        } else if (document.file_type === 'csv') {
            textContent = await parseCsv(buffer);
        } else if (document.file_type === 'txt') {
            textContent = buffer.toString('utf-8').trim();
        } else if (document.file_type === 'image') {
            const ext = document.file_path.split('.').pop()?.toLowerCase() ?? '';
            const mimeType = ext === 'png' ? 'image/png'
                : ext === 'webp' ? 'image/webp'
                : 'image/jpeg';
            imageDataUri = await parseImage(buffer, mimeType);
        } else {
            throw new Error(`Unsupported file type: ${document.file_type}`);
        }

        if (!imageDataUri && (!textContent || textContent.trim() === '')) {
            throw new Error('Could not extract any text from the document.');
        }

        // 4. Send to Claude API — run analysis and metadata extraction in parallel
        const [analysisResult, metadata] = await Promise.all([
            analyseDocument(textContent, imageDataUri),
            extractMetadata(textContent),
        ]);

        // 5. Store Results (metadata column added via migration)
        const { error: analysisErr } = await supabase
            .from('analyses')
            .insert({
                document_id: document.id,
                version: 1,
                structured_result: analysisResult.structuredResult,
                summary: analysisResult.summary,
                metadata,
            });

        if (analysisErr) throw new Error(`Database insert failed: ${analysisErr.message}`);

        // 6. Update Document Status
        await supabase.from('documents').update({ status: 'ready' }).eq('id', documentId);

        // 7. Send analysis completion email notification
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            // Re-fetch document with joined data for the email
            const { data: fullDoc } = await supabase
                .from('documents')
                .select('*, clients(name)')
                .eq('id', documentId)
                .single();

            // Get user email from Auth
            const { data: { user: authUser } } = await supabase.auth.admin.getUserById(document.user_id);
            const userEmail = authUser?.email;
            const clientName = (fullDoc as unknown as { clients: { name: string } | null })?.clients?.name || 'your client';
            const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents/${documentId}`;
            const previewSummary = cleanSummary(analysisResult.summary).split('\n\n')[0] || '';

            if (userEmail) {
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'noreply@cinatech.app',
                    to: userEmail,
                    subject: `✅ Analysis Complete — ${clientName}`,
                    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#3B82F6 0%,#6366F1 100%);padding:28px 32px;">
      <h1 style="color:white;margin:0;font-size:20px;font-weight:700;">CinaTech</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Client Analysis Portal</p>
    </div>
    <div style="padding:32px;">
      <div style="display:inline-block;background:#d1fae5;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:600;color:#065f46;margin-bottom:16px;">✅ Analysis Complete</div>
      <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px;">${clientName} — Report Ready</h2>
      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 20px;">Your AI analysis is complete. Here's a quick preview of the Executive Summary:</p>
      <div style="background:#f1f5f9;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
        <p style="color:#334155;font-size:14px;line-height:1.7;margin:0;">${previewSummary}</p>
      </div>
      <div style="text-align:center;">
        <a href="${shareUrl}" style="display:inline-block;background:linear-gradient(135deg,#3B82F6 0%,#6366F1 100%);color:white;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:600;font-size:15px;">View Full Report →</a>
      </div>
    </div>
    <div style="border-top:1px solid #f1f5f9;padding:16px 32px;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">Powered by CinaTech Client Analysis Portal</p>
    </div>
  </div>
</body></html>`,
                });
            }
        } catch (emailErr) {
            console.warn('Could not send completion email:', emailErr);
        }

        return { success: true };

    } catch (error: any) {
        console.error('Analysis pipeline error:', error);

        // Mark as error in DB and write to disk
        try {
            const fs = await import('fs');
            fs.writeFileSync(`/tmp/cinatech_error_${documentId}.log`, String(error?.stack || error?.message || error));

            const supabase = await createServiceClient();
            await supabase.from('documents').update({ status: 'error' }).eq('id', documentId);
        } catch (updateErr) {
            console.error('Failed to update error status:', updateErr);
        }

        throw error;
    }
}
