import { chromium, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const USER_DATA_DIR = path.join(process.cwd(), '.playwright-session');
const EVIDENCE_DIR = path.join(process.cwd(), 'reports', 'evidence');

async function inspectFullContentTracks() {
    console.log('=== INSPECTING ALL TRACKS IN BEATSTARS STUDIO CONTENT MANAGER ===\n');

    const context: BrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        viewport: { width: 1440, height: 900 },
        args: ['--disable-blink-features=AutomationControlled'],
    });

    const page: Page = context.pages()[0] || (await context.newPage());

    await page.goto('https://studio.beatstars.com/content/tracks', {
        waitUntil: 'networkidle',
        timeout: 60000,
    });

    if (page.url().includes('login') || page.url().includes('oauth')) {
        await page.waitForURL((url) => url.href.includes('studio.beatstars.com'), { timeout: 300000 });
        await page.goto('https://studio.beatstars.com/content/tracks', { waitUntil: 'networkidle' });
    }

    console.log('Waiting 10 seconds for Content Tracks table to render...');
    await page.waitForTimeout(10000);

    const screenshotPath = path.join(EVIDENCE_DIR, 'beatstars-content-tracks-table.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Captured Content Tracks screenshot: ${screenshotPath}`);

    // Count rows and items
    const titles = await page.evaluate(() => {
        const itemEls = Array.from(document.querySelectorAll('mat-row, tr, [class*="track-item"], [class*="row"]'));
        return itemEls.map((el) => el.textContent?.trim()).filter(Boolean);
    });

    console.log(`Discovered ${titles.length} track items in Content Tracks Manager.`);

    await context.close();
}

inspectFullContentTracks().catch(console.error);
