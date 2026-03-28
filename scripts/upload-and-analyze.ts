import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });
import { v4 as uuidv4 } from 'uuid';

async function uploadAndAnalyze() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get first client ID
    const { data: clients, error: clientErr } = await supabase.from('clients').select('id, user_id').limit(1);
    if (clientErr || !clients || clients.length === 0) {
        console.error('Failed to fetch client');
        return;
    }
    const client = clients[0];

    // 2. Read local valid PDF
    const fileBuffer = fs.readFileSync('test-client-doc.pdf');
    const safeFileName = 'test-client-doc.pdf';
    const storagePath = `${client.user_id}/${client.id}/${Date.now()}_${safeFileName}`;

    // 3. Upload to Storage
    console.log(`Uploading valid PDF to ${storagePath}...`);
    const { error: storageErr } = await supabase.storage
        .from('documents')
        .upload(storagePath, fileBuffer, {
            contentType: 'application/pdf',
            upsert: false
        });

    if (storageErr) {
        console.error('Upload failed:', storageErr);
        return;
    }

    // 4. Create DB Record
    const { data: document, error: docErr } = await supabase
        .from('documents')
        .insert({
            client_id: client.id,
            user_id: client.user_id,
            file_name: safeFileName,
            file_path: storagePath,
            file_type: 'pdf',
            status: 'uploading',
            share_token: uuidv4(),
            share_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select('*')
        .single();

    if (docErr) {
        console.error('DB insert failed:', docErr);
        return;
    }

    console.log(`Document created: ${document.id}. Triggering analysis webhook...`);

    // 5. Trigger Webhook
    try {
        const response = await fetch(`http://localhost:3000/api/documents/${document.id}/analyse`, {
            method: 'POST'
        });

        const result = await response.json();
        console.log('Webhook Response:', response.status, result);
    } catch (e) {
        console.error('Webhook failed:', e);
    }
}

uploadAndAnalyze();
