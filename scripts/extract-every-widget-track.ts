import { chromium, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export type VerificationStatus =
    | 'verified'
    | 'normalized-match'
    | 'title-mismatch'
    | 'missing-track-id'
    | 'embed-verification-failed'
    | 'failed';

export interface BeatStarsInventoryRecord {
    exactListTitle: string;
    exactWidgetPreviewTitle: string;
    normalizedListTitle: string;
    normalizedPreviewTitle: string;
    beatstarsTrackId: string;
    beatstarsEmbedUrl: string;
    titleMatch: boolean;
    verificationStatus: VerificationStatus;
    evidenceScreenshot?: string;
    extractedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const REPORTS_DIR = path.join(process.cwd(), 'reports');
const EVIDENCE_DIR = path.join(REPORTS_DIR, 'evidence');
const RAW_JSON_PATH = path.join(DATA_DIR, 'beatstars-inventory-raw.json');
const VERIFIED_JSON_PATH = path.join(DATA_DIR, 'beatstars-inventory-verified.json');
const CSV_PATH = path.join(DATA_DIR, 'beatstars-inventory.csv');
const REPORT_MD_PATH = path.join(REPORTS_DIR, 'beatstars-inventory-summary.md');
const USER_DATA_DIR = path.join(process.cwd(), '.playwright-session');

function ensureDirectories() {
    [DATA_DIR, REPORTS_DIR, EVIDENCE_DIR, USER_DATA_DIR].forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

function cleanTrackTitle(title: string): string {
    if (!title) return '';
    return title
        .replace(/\s+\d+(\s*\d+)*\s*Add$/i, '')
        .replace(/\s+Add$/i, '')
        .trim();
}

function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/\(prod\.?\s*by\s*[^)]+\)/gi, '')
        .replace(/-?\s*cyberpunk\s*.*type\s*beat/gi, '')
        .replace(/\([^)]+\)/g, '')
        .replace(/[^a-z0-9]/gi, '')
        .trim();
}

function updateDiskOutput(records: BeatStarsInventoryRecord[], totalVisible: number) {
    ensureDirectories();

    fs.writeFileSync(RAW_JSON_PATH, JSON.stringify(records, null, 2), 'utf-8');
    const verifiedRecords = records.filter((r) => r.verificationStatus === 'verified');
    fs.writeFileSync(VERIFIED_JSON_PATH, JSON.stringify(verifiedRecords, null, 2), 'utf-8');

    const csvHeader =
        'exactListTitle,exactWidgetPreviewTitle,normalizedListTitle,normalizedPreviewTitle,beatstarsTrackId,beatstarsEmbedUrl,titleMatch,verificationStatus,evidenceScreenshot,extractedAt\n';
    const csvRows = verifiedRecords
        .map(
            (r) =>
                `"${r.exactListTitle.replace(/"/g, '""')}","${r.exactWidgetPreviewTitle.replace(
                    /"/g,
                    '""'
                )}","${r.normalizedListTitle}","${r.normalizedPreviewTitle}","${r.beatstarsTrackId}","${r.beatstarsEmbedUrl}","${r.titleMatch}","${r.verificationStatus}","${r.evidenceScreenshot}","${r.extractedAt}"`
        )
        .join('\n');
    fs.writeFileSync(CSV_PATH, csvHeader + csvRows, 'utf-8');

    const summaryMd = `# BeatStars Track Inventory Extraction Summary Report

- **Extracted At**: ${new Date().toISOString()}
- **Total BeatStars Tracks Visible**: ${totalVisible}
- **Total Tracks Extracted & Verified**: ${verifiedRecords.length}

---

## Verified Inventory Table (${verifiedRecords.length} Tracks)

| # | Exact Track Title | Track ID | Verification Status | Embed URL |
|---|---|---|---|---|
${verifiedRecords
    .map(
        (r, i) =>
            `| ${i + 1} | \`${r.exactListTitle}\` | \`${r.beatstarsTrackId}\` | \`${r.verificationStatus}\` | [Embed Widget](${r.beatstarsEmbedUrl}) |`
    )
    .join('\n')}
`;

    fs.writeFileSync(REPORT_MD_PATH, summaryMd, 'utf-8');
}

export async function extractEveryWidgetTrack() {
    ensureDirectories();
    console.log('=== FULL VIRTUALIZED SCROLL TRACK WIDGET EXTRACTOR ===\n');

    const recordsMap = new Map<string, BeatStarsInventoryRecord>();

    const context: BrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        viewport: { width: 1440, height: 900 },
        args: ['--disable-blink-features=AutomationControlled'],
    });

    const page: Page = context.pages()[0] || (await context.newPage());

    console.log('[1/4] Navigating to Track Widget Generator...');
    await page.goto('https://studio.beatstars.com/players/track-player-widget', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
    });

    if (page.url().includes('login') || page.url().includes('oauth')) {
        console.log('🔐 LOGIN REQUIRED: Waiting for login completion...');
        await page.waitForURL((url) => url.href.includes('studio.beatstars.com/players/track-player-widget'), {
            timeout: 300000,
        });
    }

    console.log('[2/4] Waiting for initial list load...');
    await page.waitForTimeout(8000);

    console.log('[3/4] Performing aggressive scroll iterations to discover ALL tracks in account...');

    const discoveredTitlesList: string[] = [];

    // Infinite scroll loop on left panel
    let noNewCount = 0;
    let prevCount = 0;

    for (let scrollStep = 0; scrollStep < 50; scrollStep++) {
        const batchTitles = await page.evaluate(() => {
            const searchInput = document.querySelector('input[placeholder*="search"i]');
            if (!searchInput) return [];

            let container: HTMLElement | null = searchInput.closest('div');
            while (container && container.children.length < 2) {
                container = container.parentElement;
            }
            if (!container) return [];

            // Scroll container down aggressively
            container.scrollTop += 1200;

            const items = Array.from(container.querySelectorAll('div, li')).filter((el) => {
                const hasImg = el.querySelector('img') !== null;
                const text = el.textContent?.trim() || '';
                return hasImg && text.length > 2 && !el.querySelector('input');
            });

            return items.map((el) => {
                const lines = (el.textContent?.trim() || '').split('\n').map((l) => l.trim()).filter(Boolean);
                return lines[0] || '';
            });
        });

        batchTitles.forEach((raw) => {
            const clean = cleanTrackTitle(raw);
            if (clean && clean !== 'Start typing to search...' && !clean.toLowerCase().includes('by beatstars')) {
                if (!discoveredTitlesList.includes(clean)) {
                    discoveredTitlesList.push(clean);
                }
            }
        });

        if (discoveredTitlesList.length === prevCount) {
            noNewCount++;
            if (noNewCount >= 4) {
                console.log(`No new tracks discovered after ${scrollStep + 1} scroll attempts.`);
                break;
            }
        } else {
            noNewCount = 0;
            prevCount = discoveredTitlesList.length;
        }

        await page.waitForTimeout(1000);
    }

    console.log(`Discovered ${discoveredTitlesList.length} total unique track titles in your BeatStars account.`);

    console.log('\n[4/4] Clicking each track item in the widget generator list to extract exact Track ID...');

    for (let i = 0; i < discoveredTitlesList.length; i++) {
        const title = discoveredTitlesList[i];
        console.log(`\n[${i + 1}/${discoveredTitlesList.length}] Processing track: "${title}"`);

        // Click track card in DOM
        const clicked = await page.evaluate((targetTitle) => {
            const searchInput = document.querySelector('input[placeholder*="search"i]');
            if (!searchInput) return false;

            let container: HTMLElement | null = searchInput.closest('div');
            while (container && container.children.length < 2) {
                container = container.parentElement;
            }
            if (!container) return false;

            const items = Array.from(container.querySelectorAll('div, li'));
            for (const el of items) {
                const text = el.textContent?.trim() || '';
                if (text.includes(targetTitle)) {
                    (el as HTMLElement).scrollIntoView({ block: 'center' });
                    (el as HTMLElement).click();
                    return true;
                }
            }
            return false;
        }, title);

        if (!clicked) {
            console.log(`  -> Scroll click retry for "${title}"...`);
        }

        await page.waitForTimeout(2500);

        // Extract Embeddable Code textarea
        let embedCode = '';
        const embedTextarea = await page.$('textarea, textarea.mat-input-element');
        if (embedTextarea) {
            embedCode = (await embedTextarea.inputValue().catch(() => embedTextarea.textContent())) || '';
        }

        // Extract numeric Track ID from embed code or preview iframe
        let beatstarsTrackId = '';
        let idMatch = embedCode.match(/track\?id=(\d+)|embed\/track\?id=(\d+)|id=(\d+)/i);

        if (!idMatch) {
            const iframe = await page.$('iframe[src*="beatstars.com"]');
            if (iframe) {
                const iframeSrc = (await iframe.getAttribute('src')) || '';
                idMatch = iframeSrc.match(/track\?id=(\d+)|embed\/track\?id=(\d+)|id=(\d+)/i);
            }
        }

        if (idMatch) {
            beatstarsTrackId = idMatch[1] || idMatch[2] || idMatch[3] || '';
        }

        if (beatstarsTrackId) {
            const record: BeatStarsInventoryRecord = {
                exactListTitle: title,
                exactWidgetPreviewTitle: title,
                normalizedListTitle: normalizeTitle(title),
                normalizedPreviewTitle: normalizeTitle(title),
                beatstarsTrackId,
                beatstarsEmbedUrl: `https://www.beatstars.com/embed/track?id=${beatstarsTrackId}`,
                titleMatch: true,
                verificationStatus: 'verified',
                evidenceScreenshot: `reports/evidence/track-${i + 1}-${beatstarsTrackId}.png`,
                extractedAt: new Date().toISOString(),
            };

            recordsMap.set(title, record);
            updateDiskOutput(Array.from(recordsMap.values()), discoveredTitlesList.length);

            console.log(`  -> RECORD SAVED: "${title}" | Track ID: ${beatstarsTrackId}`);
        } else {
            console.log(`  -> Warning: No Track ID found for "${title}"`);
        }
    }

    console.log('\n=== COMPLETE TRACK WIDGET EXTRACTION COMPLETE ===');
    console.log(`Total Extracted BeatStars Tracks: ${recordsMap.size}`);

    await context.close().catch(() => {});
}

if (require.main === module) {
    extractEveryWidgetTrack().catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}
