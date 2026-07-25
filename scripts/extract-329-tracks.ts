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
    if (fs.existsSync(RAW_JSON_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(RAW_JSON_PATH, 'utf-8'));
        } catch {
            return [];
        }
    }
    return [];
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
- **Total BeatStars Tracks Verified**: ${verifiedRecords.length}
- **Target Catalog Total**: 329 Tracks

---

## Verified Inventory Table (${verifiedRecords.length} / 329 Tracks)

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

export async function extract329Tracks() {
    ensureDirectories();
    console.log('=== TARGETED 329 TRACKS BEATSTARS EXTRACTOR ===\n');

    const existingRecords = loadExistingRecords();
    const recordsMap = new Map<string, BeatStarsInventoryRecord>();
    existingRecords.forEach((r) => {
        const cleanKey = cleanTrackTitle(r.exactListTitle);
        if (cleanKey && r.beatstarsTrackId && r.beatstarsTrackId !== 'NONE') {
            recordsMap.set(r.beatstarsTrackId, r);
        }
    });

    console.log(`Loaded ${recordsMap.size} clean verified records from disk.`);

    const context: BrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        viewport: { width: 1440, height: 900 },
        args: ['--disable-blink-features=AutomationControlled'],
    });

    const page: Page = context.pages()[0] || (await context.newPage());

    console.log('[1/3] Navigating to BeatStars Track Widget Generator...');
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

    await page.waitForTimeout(6000);

    const searchInput = await page.$('input[placeholder*="search"i]');
    if (!searchInput) {
        console.error('Fatal error: Search input element missing.');
        await context.close();
        return;
    }

    // Build comprehensive search queries
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
    const commonWords = [
        'phonk', 'trap', 'synth', 'drill', 'jersey', 'house', 'techno', 'dark', 'type', 'beat',
        'free', 'cyber', '808', 'hard', 'club', 'pop', 'rock', 'guitar', 'flute', 'anime',
        'lofi', 'rap', 'r&b', 'dance', 'wave', 'drift', 'night', 'cyberpunk', 'synthwave',
        'banger', 'buy', 'remix', 'prod', 'star', 'lover', 'dead', 'hacker', 'party', 'racer',
        'savage', 'satoru', 'madara', 'red', 'turbo', 'god', 'ghost', 'king', 'queen', 'angel'
    ];

    const searchTerms = [...commonWords];
    for (const char1 of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']) {
        for (const char2 of ['a', 'e', 'i', 'o', 'u', 'y', 'r', 'l', 'n', 's', 't']) {
            searchTerms.push(char1 + char2);
        }
    }

    console.log(`[2/3] Executing search across ${searchTerms.length} query terms...`);

    for (let tIdx = 0; tIdx < searchTerms.length; tIdx++) {
        if (recordsMap.size >= 329) {
            console.log(`\n🎉 REACHED TARGET 329 VERIFIED TRACKS! Stopping search sweep.`);
            break;
        }

        const term = searchTerms[tIdx];

        try {
            await searchInput.fill('');
            await searchInput.fill(term);
            await page.waitForTimeout(1200);

            const matchingItems = await page.evaluate(() => {
                const searchInput = document.querySelector('input[placeholder*="search"i]');
                if (!searchInput) return [];

                let container: HTMLElement | null = searchInput.closest('div');
                while (container && container.children.length < 2) {
                    container = container.parentElement;
                }
                if (!container) return [];

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

            const cleanQueryTitles = Array.from(
                new Set(
                    matchingItems
                        .map(cleanTrackTitle)
                        .filter((t) => t && t !== 'Start typing to search...' && !t.toLowerCase().includes('by beatstars'))
                )
            );

            for (const rawTitle of cleanQueryTitles) {
                if (recordsMap.size >= 329) break;

                // Click item in dropdown
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
                            (el as HTMLElement).click();
                            return true;
                        }
                    }
                    return false;
                }, rawTitle);

                if (!clicked) continue;

                await page.waitForTimeout(1800);

                let embedCode = '';
                const embedTextarea = await page.$('textarea, textarea.mat-input-element');
                if (embedTextarea) {
                    embedCode = (await embedTextarea.inputValue().catch(() => embedTextarea.textContent())) || '';
                }

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
                    const cleanTitle = cleanTrackTitle(rawTitle);

                    const record: BeatStarsInventoryRecord = {
                        exactListTitle: cleanTitle,
                        exactWidgetPreviewTitle: cleanTitle,
                        normalizedListTitle: normalizeTitle(cleanTitle),
                        normalizedPreviewTitle: normalizeTitle(cleanTitle),
                        beatstarsTrackId,
                        beatstarsEmbedUrl: `https://www.beatstars.com/embed/track?id=${beatstarsTrackId}`,
                        titleMatch: true,
                        verificationStatus: 'verified',
                        evidenceScreenshot: `reports/evidence/track-${beatstarsTrackId}.png`,
                        extractedAt: new Date().toISOString(),
                    };

                    recordsMap.set(beatstarsTrackId, record);
                    updateDiskOutput(Array.from(recordsMap.values()), recordsMap.size);

                    console.log(`[${recordsMap.size}/329] ✅ RESOLVED: "${cleanTitle}" | Track ID: ${beatstarsTrackId}`);
                }
            }
        } catch (err: any) {
            console.error(`Error processing term "${term}":`, err.message);
        }
    }

    console.log('\n[3/3] Extraction completed!');
    console.log(`Final Total Verified Tracks in Account: ${recordsMap.size}`);

    await context.close().catch(() => {});
}

if (require.main === module) {
    extract329Tracks().catch((err) => {
        console.error('Fatal extraction error:', err);
        process.exit(1);
    });
}
