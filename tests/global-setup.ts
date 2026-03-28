import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(process.cwd(), 'playwright', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
    // Ensure the auth directory exists
    fs.mkdirSync(path.dirname(authFile), { recursive: true });

    await page.goto('/login');
    await expect(page.locator('input#email')).toBeVisible({ timeout: 15_000 });

    await page.locator('input#email').fill(process.env.TEST_USER_EMAIL!);
    await page.locator('input#password').fill(process.env.TEST_USER_PASSWORD!);
    await page.locator('button[type="submit"]').click();

    // Login page uses useActionState + useEffect to call router.push(state.redirect)
    // so wait for the URL to change to /dashboard
    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    await page.context().storageState({ path: authFile });
});
