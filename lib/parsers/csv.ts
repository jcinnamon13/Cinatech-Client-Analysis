/**
 * CSV Parser — converts raw CSV buffer into a structured, readable text
 * representation suitable for Claude AI analysis.
 */
export async function parseCsv(buffer: Buffer): Promise<string> {
    try {
        const text = buffer.toString('utf-8');
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        // Parse headers from first row
        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(parseCSVLine);

        // Build a readable representation for AI analysis
        const sections: string[] = [];

        // Summary line
        sections.push(`CSV Document — ${headers.length} columns, ${rows.length} data rows`);
        sections.push('');

        // Column headers
        sections.push('Columns: ' + headers.join(' | '));
        sections.push('');

        // Render each row as named key:value pairs
        sections.push('Data:');
        rows.forEach((row, i) => {
            const pairs = headers.map((h, idx) => `${h}: ${row[idx] ?? ''}`).join(', ');
            sections.push(`Row ${i + 1}: ${pairs}`);
        });

        return sections.join('\n');
    } catch (error) {
        console.error('CSV parsing error:', error);
        throw new Error('Failed to extract text from CSV document');
    }
}

/** Parses a single CSV line respecting quoted fields. */
function parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    fields.push(current.trim());
    return fields;
}
