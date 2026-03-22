import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getFileType } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const clientName = formData.get('clientName') as string;
        const file = formData.get('file') as File;

        if (!clientName || !file) {
            return NextResponse.json({ error: 'Missing client name or file' }, { status: 400 });
        }

        // Server-side type validation (belt-and-suspenders after client check)
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg', 'image/png', 'image/webp',
            'text/plain', 'text/csv', 'application/csv',
            // Empty string: some OS/browser combos for .txt
            '',
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: `Unsupported file type: "${file.type}"` }, { status: 400 });
        }

        console.log(`[upload] file="${file.name}" type="${file.type}" size=${file.size}`);

        // 1. Get or Create Client
        let clientId: string;
        const { data: existingClient, error: clientErr } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', clientName)
            .maybeSingle();

        if (clientErr) throw new Error(`Client lookup failed: ${clientErr.message}`);

        if (existingClient) {
            clientId = existingClient.id;
        } else {
            const { data: newClient, error: createErr } = await supabase
                .from('clients')
                .insert({ user_id: user.id, name: clientName })
                .select('id')
                .single();

            if (createErr) throw new Error(`Client creation failed: ${createErr.message}`);
            clientId = newClient.id;
        }

        // 2. Upload File to Supabase Storage
        // We use the service_role client to upload to guarantee it bypasses RLS issues 
        // in case the user didn't fully configure their bucket policies
        const { createServiceClient } = await import('@/lib/supabase/server');
        const adminSupabase = await createServiceClient();

        // Ensure bucket exists (soft-fail if it already does)
        await adminSupabase.storage.createBucket('documents', { public: false });

        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `${user.id}/${clientId}/${Date.now()}_${safeFileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const fileBody = Buffer.from(arrayBuffer);

        const { error: storageErr } = await adminSupabase.storage
            .from('documents')
            .upload(storagePath, fileBody, {
                contentType: file.type,
                upsert: false
            });

        if (storageErr) throw new Error(`Storage upload failed: ${storageErr.message}`);

        // 3. Create Document DB Record
        const shareToken = uuidv4();
        const fileType = getFileType(file.name);

        const { data: document, error: docErr } = await supabase
            .from('documents')
            .insert({
                client_id: clientId,
                user_id: user.id,
                file_name: file.name,
                file_path: storagePath,
                file_type: fileType,
                status: 'uploading', // Will change to 'analysing' when passed to AI
                share_token: shareToken
            })
            .select('*')
            .single();

        if (docErr) throw new Error(`Document DB creation failed: ${docErr.message}`);

        // Fire off the AI analysis asynchronously. We don't await this because 
        // Vercel serverless functions have a 10s default timeout limit, but Claude 
        // might take 3-4 minutes for a large document. We use a dynamic import 
        // stringing a decoupled native promise execution to evade Next.js's 300s 
        // internal HTTP fetch socket timeout bug.
        import('@/lib/ai/process').then(({ processAnalysis }) => {
            processAnalysis(document.id).catch(e => console.error('Failed async analysis natively:', e));
        });

        return NextResponse.json({
            success: true,
            document,
            clientId
        });

    } catch (err: unknown) {
        console.error('Upload error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
