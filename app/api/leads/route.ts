import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { fullName, email, phone, website, summary } = data;

    // Resolve the path exactly to the root of the project
    const csvPath = path.join(process.cwd(), 'client_database_free_report.csv');

    let fileExists = false;
    try {
      if (fs.existsSync(csvPath)) {
        fileExists = true;
      }
    } catch(err) {
      // Ignored
    }

    // Safely wrap text in quotes and escape internal quotes to prevent CSV breakage from commas
    const escapeCsv = (str: string | undefined | null) => {
        if (!str) return '""';
        return `"${str.toString().replace(/"/g, '""')}"`;
    };

    const dateStr = new Date().toISOString();
    const row = `${escapeCsv(dateStr)},${escapeCsv(fullName)},${escapeCsv(email)},${escapeCsv(phone)},${escapeCsv(website)},${escapeCsv(summary)}\n`;

    if (!fileExists) {
        const header = `"Timestamp","Full Name","Email","Phone","Website","Business Summary"\n`;
        fs.appendFileSync(csvPath, header);
    }

    fs.appendFileSync(csvPath, row);

    return NextResponse.json({ success: true, message: 'Lead added to CSV database' });
  } catch (error) {
    console.error('Error writing to leads CSV:', error);
    return NextResponse.json({ error: 'Failed to record lead snippet.' }, { status: 500 });
  }
}
