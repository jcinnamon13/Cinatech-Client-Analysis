import { test, expect, Browser } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test.describe('Export route', () => {
    let documentId: string;

    test.beforeAll(async () => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Look up the test user by email via admin API
        const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const testUser = usersData?.users?.find(u => u.email === process.env.TEST_USER_EMAIL);

        if (!testUser) {
            throw new Error(
                `Test user ${process.env.TEST_USER_EMAIL} not found in Supabase — check TEST_USER_EMAIL in .env.local`
            );
        }

        // Find the most recently completed document owned by the test user
        const { data: doc } = await supabase
            .from('documents')
            .select('id')
            .eq('user_id', testUser.id)
            .eq('status', 'ready')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!doc) {
            // Skip gracefully rather than fail — run upload-to-analysis.spec.ts first
            test.skip(true, 'No ready document found — run upload-to-analysis tests first to create one');
            return;
        }

        documentId = doc.id;
    });

    test('GET ?format=docx returns a valid DOCX file', async ({ request }) => {
        const response = await request.get(`/api/documents/${documentId}/export?format=docx`);

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        expect(response.headers()['content-disposition']).toContain('.docx');

        const body = await response.body();
        expect(body.length).toBeGreaterThan(1000);
        // DOCX is a ZIP file — always starts with PK magic bytes (0x50 0x4B)
        expect(body[0]).toBe(0x50);
        expect(body[1]).toBe(0x4b);
    });

    test('GET ?format=pdf returns a valid PDF file', async ({ request }) => {
        const response = await request.get(`/api/documents/${documentId}/export?format=pdf`);

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/pdf');
        expect(response.headers()['content-disposition']).toContain('.pdf');

        const body = await response.body();
        expect(body.length).toBeGreaterThan(500);
        // PDF files always start with %PDF
        const header = body.subarray(0, 4).toString('ascii');
        expect(header).toBe('%PDF');
    });

    test('GET with invalid format returns 400', async ({ request }) => {
        const response = await request.get(`/api/documents/${documentId}/export?format=xls`);
        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.error).toBeTruthy();
    });

    test('GET without authentication returns 401', async ({ browser }: { browser: Browser }) => {
        // Create a fresh context with no stored cookies (unauthenticated)
        const context = await browser.newContext({ storageState: undefined });
        try {
            const response = await context.request.get(
                `http://localhost:3000/api/documents/${documentId}/export?format=pdf`
            );
            expect(response.status()).toBe(401);

            const body = await response.json();
            expect(body.error).toBe('Unauthorized');
        } finally {
            await context.close();
        }
    });
});
