import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // ── 1. Rate Limiting ─────────────────────────────────────────────────────
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxRequests = 3;

    const entry = rateLimitMap.get(ip);
    if (entry && now < entry.resetTime) {
      if (entry.count >= maxRequests) {
        const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
        );
      }
      entry.count += 1;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    }

    // ── 2. Input Validation ───────────────────────────────────────────────────
    const { fullName: rawFullName, email: rawEmail, summary: rawSummary } = data;

    if (!rawFullName || typeof rawFullName !== 'string' || rawFullName.trim() === '') {
      return NextResponse.json({ error: 'fullName is required.' }, { status: 400 });
    }
    if (!rawEmail || typeof rawEmail !== 'string' || rawEmail.trim() === '') {
      return NextResponse.json({ error: 'email is required.' }, { status: 400 });
    }
    if (!rawSummary || typeof rawSummary !== 'string' || rawSummary.trim() === '') {
      return NextResponse.json({ error: 'summary is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail.trim())) {
      return NextResponse.json({ error: 'email is not a valid address.' }, { status: 400 });
    }

    // ── 3. Spam Filtering ─────────────────────────────────────────────────────
    const urlPattern = /https?:\/\/|www\./i;
    if (urlPattern.test(rawFullName)) {
      return NextResponse.json({ error: 'Submission rejected.' }, { status: 400 });
    }

    const spamKeywords = [
      'casino', 'viagra', 'crypto', 'nft',
      'click here', 'free money', 'earn money', 'make money',
    ];
    const allFieldValues = Object.values(data).map((v) =>
      typeof v === 'string' ? v.toLowerCase() : ''
    );
    const isSpam = spamKeywords.some((keyword) =>
      allFieldValues.some((fieldValue) => fieldValue.includes(keyword))
    );
    if (isSpam) {
      return NextResponse.json({ error: 'Submission rejected.' }, { status: 400 });
    }

    const { fullName, email, phone, website, summary } = data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Safely wrap text in quotes and escape internal quotes to prevent CSV breakage from commas
    const escapeCsv = (str: string | undefined | null) => {
        if (!str) return '""';
        return `"${str.toString().replace(/"/g, '""')}"`;
    };

    const dateStr = new Date().toISOString();
    const row = `${escapeCsv(dateStr)},${escapeCsv(fullName)},${escapeCsv(email)},${escapeCsv(phone)},${escapeCsv(website)},${escapeCsv(summary)}\n`;

    // Ensure Bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === 'leads')) {
      await supabase.storage.createBucket('leads', { public: false });
    }

    // Try to download existing file
    const { data: fileData } = await supabase.storage.from('leads').download('client_database_free_report.csv');
    
    let content = `"Timestamp","Full Name","Email","Phone","Website","Business Summary"\n`;
    if (fileData) {
      content = await fileData.text();
    }

    content += row;

    // Upload or Upsert the file back to Storage
    const { error: uploadError } = await supabase.storage.from('leads').upload('client_database_free_report.csv', content, {
      upsert: true,
      contentType: 'text/csv'
    });

    if (uploadError) {
      console.error('Supabase Upload Error:', uploadError);
      throw new Error(uploadError.message);
    }

    return NextResponse.json({ success: true, message: 'Lead perfectly added to remote CSV database' });
  } catch (error) {
    console.error('Error writing to leads remote CSV:', error);
    return NextResponse.json({ error: 'Failed to record lead snippet.' }, { status: 500 });
  }
}
