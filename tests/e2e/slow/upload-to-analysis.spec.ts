import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

test.describe('Upload → Analysis pipeline', () => {
    let documentId: string;
    let clientId: string;

    // Allow up to 7 minutes: upload + async Claude analysis (up to 6 min) + assertions
    test.setTimeout(420_000);

    test.afterAll(async () => {
        if (!documentId) return;
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        // Delete in dependency order to satisfy any FK constraints
        await supabase.from('analyses').delete().eq('document_id', documentId);
        await supabase.from('documents').delete().eq('id', documentId);
        if (clientId) await supabase.from('clients').delete().eq('id', clientId);
    });

    test('upload document, wait for analysis, verify JSON structure', async ({ page }) => {
        // ── Step 1: Navigate to the upload page ──────────────────────────────────
        // Warm up the authenticated session first — the middleware's Supabase getUser()
        // call has a 1200ms cold-start timeout; a prior request to any protected route
        // establishes the connection so the /upload navigation lands correctly.
        await page.goto('/dashboard');
        await page.goto('/upload');
        await expect(page.locator('h1')).toContainText('Upload Client Documents');

        // ── Step 2: Fill in a unique client name ─────────────────────────────────
        const clientName = `E2E Test ${Date.now()}`;
        await page.locator('input[placeholder="e.g. Acme Corp Operations"]').fill(clientName);

        // ── Step 3: Attach the test fixture ──────────────────────────────────────
        const fixturePath = path.resolve(__dirname, '../fixtures/test-document.txt');
        await page.locator('input[type="file"]').setInputFiles(fixturePath);

        // ── Step 4: Intercept the upload API response to capture documentId ──────
        const uploadResponsePromise = page.waitForResponse(
            resp => resp.url().includes('/api/documents/upload') && resp.status() === 200,
            { timeout: 30_000 }
        );

        await page.locator('button:has-text("Upload & Analyse Documents")').click();

        const uploadResponse = await uploadResponsePromise;
        const uploadBody = await uploadResponse.json();

        expect(uploadBody.success).toBe(true);
        expect(uploadBody.document?.id).toBeTruthy();

        documentId = uploadBody.document.id;
        clientId = uploadBody.clientId;

        // ── Step 5: Wait for redirect to dashboard ────────────────────────────────
        // The page does router.push('/dashboard') after a 1s delay on success
        await page.waitForURL('**/dashboard', { timeout: 10_000 });

        // ── Step 6: Navigate directly to the document page ───────────────────────
        await page.goto(`/documents/${documentId}`);

        // ── Step 7: Poll for analysis completion ──────────────────────────────────
        // AutoRefresh component calls router.refresh() every 5 seconds while pending.
        // Wait for "Executive Summary" heading to appear — means status = ready.
        await expect(page.locator('h2:has-text("Executive Summary")')).toBeVisible({ timeout: 360_000 });

        // ── Step 8: Verify the structured JSON via Supabase service role ──────────
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: analysis, error: analysisErr } = await supabase
            .from('analyses')
            .select('structured_result')
            .eq('document_id', documentId)
            .order('version', { ascending: false })
            .limit(1)
            .single();

        expect(analysisErr).toBeNull();
        expect(analysis?.structured_result).toBeTruthy();

        const result = analysis!.structured_result as {
            pillars: {
                question: string;
                original_response: string;
                improved_response: string;
                recommendations: string[];
                flags: string[];
            }[];
            priority_action_plan: {
                action: string;
                owner: string;
                deadline: string;
                pillar: string;
                consequence: string;
                time_horizon: string;
            }[];
        };

        // Top-level shape
        expect(Array.isArray(result.pillars)).toBe(true);
        expect(result.pillars.length).toBeGreaterThan(0);
        expect(Array.isArray(result.priority_action_plan)).toBe(true);
        expect(result.priority_action_plan.length).toBeGreaterThan(0);

        // Every pillar must have all required fields
        for (const pillar of result.pillars) {
            expect(typeof pillar.question).toBe('string');
            expect(pillar.question.length).toBeGreaterThan(0);
            expect(typeof pillar.original_response).toBe('string');
            expect(typeof pillar.improved_response).toBe('string');
            expect(Array.isArray(pillar.recommendations)).toBe(true);
            expect(Array.isArray(pillar.flags)).toBe(true);
        }

        // Every priority action plan item must have all required fields
        for (const item of result.priority_action_plan) {
            expect(typeof item.action).toBe('string');
            expect(item.action.length).toBeGreaterThan(0);
            expect(typeof item.owner).toBe('string');
            expect(typeof item.deadline).toBe('string');
            expect(typeof item.pillar).toBe('string');
            expect(typeof item.consequence).toBe('string');
            expect(typeof item.time_horizon).toBe('string');
            expect(item.time_horizon.length).toBeGreaterThan(0);
            const validHorizons = ['Immediate', 'Short-term', 'Medium-term', 'Strategic'];
            expect(validHorizons.some(h => item.time_horizon.includes(h))).toBe(true);
        }
    });
});
