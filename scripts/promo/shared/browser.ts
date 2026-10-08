import fs from 'node:fs';
import { chromium, type Browser } from 'playwright-core';

// Uses CHROME_PATH if set, then a Playwright-managed Chromium, then the
// installed Google Chrome (the usual case on a desktop).
export async function launch(): Promise<Browser> {
    const candidates = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean) as string[];
    const executablePath = candidates.find((p) => fs.existsSync(p));
    return executablePath ? chromium.launch({ executablePath }) : chromium.launch({ channel: 'chrome' });
}
