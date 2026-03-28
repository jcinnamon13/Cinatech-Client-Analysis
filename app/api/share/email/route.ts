import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { cleanSummary } from '@/lib/utils';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, email } = await request.json();

    if (!documentId || !email) {
      return NextResponse.json({ error: 'Missing documentId or email' }, { status: 400 });
    }

    // Fetch document and analysis (verify ownership)
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
                *,
                clients (name),
                analyses (summary, structured_result)
            `)
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (error || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const clientName = document.clients?.name || 'Unknown Client';
    const rawSummary = document.analyses?.[0]?.summary || 'Analysis is still pending.';
    const summary = cleanSummary(rawSummary);
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${document.share_token}`;

    // Send email via Resend
    const { error: resendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@cinatech.app',
      to: email,
      subject: `CinaTech Analysis Report: ${clientName}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CinaTech Analysis Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">CinaTech</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">Client Analysis Portal</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 32px;">
      <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 8px;">Analysis Report Shared</h2>
      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        A CinaTech analysis report has been shared with you for client <strong>${clientName}</strong>.
      </p>

      <!-- Executive Summary Box -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
        <h3 style="color: #4f46e5; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">Executive Summary</h3>
        <p style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0;">${summary.replace(/\n\n/g, '<br><br>')}</p>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin: 24px 0 0;">
        <a href="${shareUrl}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;">
          View Full Report →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #f1f5f9; padding: 20px 32px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">Powered by CinaTech Client Analysis Portal</p>
    </div>
  </div>
</body>
</html>`,
    });

    if (resendError) {
      console.error('Resend error:', resendError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Share email error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
