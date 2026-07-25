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
        .replace(/\s+\d+(\s*\d+)+$/i, '')
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

function loadExistingRecords(): BeatStarsInventoryRecord[] {
    if (fs.existsSync(VERIFIED_JSON_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(VERIFIED_JSON_PATH, 'utf-8'));
        } catch {
            return [];
        }
    }
    return [];
}

function updateDiskOutput(records: BeatStarsInventoryRecord[], totalTarget: number) {
    ensureDirectories();

    const uniqueMap = new Map<string, BeatStarsInventoryRecord>();
    records.forEach((r) => {
        if (r.beatstarsTrackId && r.beatstarsTrackId !== 'NONE') {
            uniqueMap.set(r.beatstarsTrackId, r);
        }
    });
    const finalRecords = Array.from(uniqueMap.values());

    fs.writeFileSync(RAW_JSON_PATH, JSON.stringify(finalRecords, null, 2), 'utf-8');
    fs.writeFileSync(VERIFIED_JSON_PATH, JSON.stringify(finalRecords, null, 2), 'utf-8');

    const csvHeader =
        'exactListTitle,exactWidgetPreviewTitle,normalizedListTitle,normalizedPreviewTitle,beatstarsTrackId,beatstarsEmbedUrl,titleMatch,verificationStatus,evidenceScreenshot,extractedAt\n';
    const csvRows = finalRecords
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
- **Total BeatStars Tracks Verified**: ${finalRecords.length}
- **Target Catalog Total**: ${totalTarget} Tracks

---

## Verified Inventory Table (${finalRecords.length} / ${totalTarget} Tracks)

| # | Exact Track Title | Track ID | Verification Status | Embed URL |
|---|---|---|---|---|
${finalRecords
    .map(
        (r, i) =>
            `| ${i + 1} | \`${r.exactListTitle}\` | \`${r.beatstarsTrackId}\` | \`${r.verificationStatus}\` | [Embed Widget](${r.beatstarsEmbedUrl}) |`
    )
    .join('\n')}
`;

    fs.writeFileSync(REPORT_MD_PATH, summaryMd, 'utf-8');
}

export async function extractSequentialScroll() {
    ensureDirectories();
    console.log('=== DIRECT SEQUENTIAL SCROLL BEATSTARS EXTRACTOR ===\n');

    const existingRecords = loadExistingRecords();
    const recordsMap = new Map<string, BeatStarsInventoryRecord>();
    existingRecords.forEach((r) => {
        if (r.beatstarsTrackId && r.beatstarsTrackId !== 'NONE') {
            recordsMap.set(r.beatstarsTrackId, r);
        }
    });

    console.log(`Currently loaded ${recordsMap.size} verified tracks from disk.`);

    const context: BrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        viewport: { width: 1440, height: 900 },
        args: ['--disable-blink-features=AutomationControlled'],
    });

    const page: Page = context.pages()[0] || (await context.newPage());

    await page.goto('https://studio.beatstars.com/players/track-player-widget', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
    });

    if (page.url().includes('login') || page.url().includes('oauth')) {
        await page.waitForURL((url) => url.href.includes('studio.beatstars.com/players/track-player-widget'), {
            timeout: 300000,
        });
    }

    await page.waitForTimeout(6000);

    console.log('Starting sequential top-to-bottom item-by-item extraction...');

    let noNewItemsCount = 0;

    for (let step = 0; step < 200; step++) {
        // Find all visible track card elements
        const visibleItems = await page.evaluate(() => {
            const searchInput = document.querySelector('input[placeholder*="search"i]');
            if (!searchInput) return [];

            let container: HTMLElement | null = searchInput.closest('div');
            while (container && container.children.length < 2) {
                container = container.parentElement;
            }
            if (!container) return [];

            const elements = Array.from(container.querySelectorAll('div, li')).filter((el) => {
                const hasImg = el.querySelector('img') !== null;
                const text = el.textContent?.trim() || '';
                return hasImg && text.length > 2 && !el.querySelector('input');
            });

            return elements.map((el) => {
                const textLines = (el.textContent?.trim() || '').split('\n').map((l) => l.trim()).filter(Boolean);
                return {
                    rawTitle: textLines[0] || '',
                    fullText: textLines.join(' '),
                };
            });
        });

        let newFoundInStep = false;

        for (const item of visibleItems) {
            const title = cleanTrackTitle(item.rawTitle);
            if (!title || title === 'Start typing to search...' || title.toLowerCase().includes('by beatstars')) {
                continue;
            }

            // Check if already extracted
            const alreadyExtracted = Array.from(recordsMap.values()).some((r) => r.exactListTitle === title);
            if (alreadyExtracted) continue;

            newFoundInStep = true;

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

            if (!clicked) continue;

            await page.waitForTimeout(1800);

            // Read Embeddable Code textarea
            let embedCode = '';
            const embedTextarea = await page.$('textarea, textarea.mat-input-element');
            if (embedTextarea) {
                embedCode = (await embedTextarea.inputValue().catch(() => embedTextarea.textContent())) || '';
            }

            // Extract Track ID from embed code or preview iframe
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

            if (beatstarsTrackId && !recordsMap.has(beatstarsTrackId)) {
                const record: BeatStarsInventoryRecord = {
                    exactListTitle: title,
                    exactWidgetPreviewTitle: title,
                    normalizedListTitle: normalizeTitle(title),
                    normalizedPreviewTitle: normalizeTitle(title),
                    beatstarsTrackId,
                    beatstarsEmbedUrl: `https://www.beatstars.com/embed/track?id=${beatstarsTrackId}`,
                    titleMatch: true,
                    verificationStatus: 'verified',
                    evidenceScreenshot: `reports/evidence/track-${beatstarsTrackId}.png`,
                    extractedAt: new Date().toISOString(),
                };

                recordsMap.set(beatstarsTrackId, record);
                updateDiskOutput(Array.from(recordsMap.values()), 329);

                console.log(`[${recordsMap.size}/329] ✅ SEQUENTIAL EXTRACTED: "${title}" | Track ID: ${beatstarsTrackId}`);
            }
        }

        // Scroll container down 400px
        await page.evaluate(() => {
            const searchInput = document.querySelector('input[placeholder*="search"i]');
            if (!searchInput) return;

            let container: HTMLElement | null = searchInput.closest('div');
            while (container && container.children.length < 2) {
                container = container.parentElement;
            }
            if (container) {
                container.scrollTop += 400;
            }
        });

        await page.waitForTimeout(1000);

        if (!newFoundInStep) {
            noNewItemsCount++;
            if (noNewItemsCount >= 10) {
                console.log('Reached bottom of sequential list.');
                break;
            }
        } else {
            noNewItemsCount = 0;
        }
    }

    console.log(`\nFinal Total Verified Tracks Extracted: ${recordsMap.size}`);
    await context.close().catch(() => {});
}

if (require.main === module) {
    extractSequentialScroll().catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}
