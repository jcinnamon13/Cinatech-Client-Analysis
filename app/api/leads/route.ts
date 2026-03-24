import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const data = await request.json();
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
