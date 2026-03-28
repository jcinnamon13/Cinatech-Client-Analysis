import { defineConfig } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// Playwright doesn't auto-load .env.local like Next.js does — load it manually
loadEnv({ path: '.env.local' });

export default defineConfig({
    testDir: './tests',
    timeout: 30_000,
    retries: process.env.CI ? 1 : 0,
    reporter: [['html', { open: 'never' }], ['list']],
    use: {
        baseURL: 'http://localhost:3000',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /global-setup\.ts/,
        },
        {
            name: 'e2e',
            testMatch: /tests\/e2e\/[^/]+\.spec\.ts/,
            dependencies: ['setup'],
            use: {
                storageState: 'playwright/.auth/user.json',
            },
        },
        {
            name: 'slow',
            testMatch: /tests\/e2e\/slow\/.+\.spec\.ts/,
            dependencies: ['setup'],
            use: {
                storageState: 'playwright/.auth/user.json',
            },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
