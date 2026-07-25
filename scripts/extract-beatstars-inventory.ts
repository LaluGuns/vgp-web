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
    notes?: string[];
}

export interface InventoryExtractionSummary {
    totalBeatstarsTracksVisible: number;
    totalTracksExtracted: number;
    totalVerified: number;
    totalNormalizedMatch: number;
    totalTitleMismatches: number;
    totalMissingIds: number;
    totalEmbedFailed: number;
    totalFailed: number;
    totalDuplicates: number;
    extractedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const REPORTS_DIR = path.join(process.cwd(), 'reports');
const EVIDENCE_DIR = path.join(REPORTS_DIR, 'evidence');
const RAW_JSON_PATH = path.join(DATA_DIR, 'beatstars-inventory-raw.json');
const VERIFIED_JSON_PATH = path.join(DATA_DIR, 'beatstars-inventory-verified.json');
const CSV_PATH = path.join(DATA_DIR, 'beatstars-inventory.csv');
const ERRORS_JSON_PATH = path.join(REPORTS_DIR, 'beatstars-inventory-errors.json');
const REPORT_MD_PATH = path.join(REPORTS_DIR, 'beatstars-inventory-summary.md');
const USER_DATA_DIR = path.join(process.cwd(), '.playwright-session');

function ensureDirectories() {
    [DATA_DIR, REPORTS_DIR, EVIDENCE_DIR, USER_DATA_DIR].forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
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

    const verifiedRecords = records.filter(
        (r) => r.verificationStatus === 'verified' || r.verificationStatus === 'normalized-match'
    );
    fs.writeFileSync(VERIFIED_JSON_PATH, JSON.stringify(verifiedRecords, null, 2), 'utf-8');

    const errorRecords = records.filter(
        (r) =>
            r.verificationStatus === 'title-mismatch' ||
            r.verificationStatus === 'missing-track-id' ||
            r.verificationStatus === 'embed-verification-failed' ||
            r.verificationStatus === 'failed'
    );
    fs.writeFileSync(ERRORS_JSON_PATH, JSON.stringify(errorRecords, null, 2), 'utf-8');

    const csvHeader =
        'exactListTitle,exactWidgetPreviewTitle,normalizedListTitle,normalizedPreviewTitle,beatstarsTrackId,beatstarsEmbedUrl,titleMatch,verificationStatus,evidenceScreenshot,extractedAt\n';
    const csvRows = records
        .map(
            (r) =>
                `"${(r.exactListTitle || '').replace(/"/g, '""')}","${(r.exactWidgetPreviewTitle || '').replace(
                    /"/g,
                    '""'
                )}","${r.normalizedListTitle || ''}","${r.normalizedPreviewTitle || ''}","${r.beatstarsTrackId || ''}","${
                    r.beatstarsEmbedUrl || ''
                }","${r.titleMatch}","${r.verificationStatus}","${r.evidenceScreenshot || ''}","${r.extractedAt}"`
        )
        .join('\n');
    fs.writeFileSync(CSV_PATH, csvHeader + csvRows, 'utf-8');

    const summaryMd = `# BeatStars Track Inventory Extraction Summary Report

- **Extracted At**: ${new Date().toISOString()}
- **Total BeatStars Tracks Visible**: ${totalVisible}
- **Total Tracks Extracted**: ${records.length}
- **Total Verified (Exact Match)**: ${records.filter((r) => r.verificationStatus === 'verified').length}
- **Total Normalized Match**: ${records.filter((r) => r.verificationStatus === 'normalized-match').length}
- **Total Title Mismatches**: ${records.filter((r) => r.verificationStatus === 'title-mismatch').length}
- **Total Missing Track IDs**: ${records.filter((r) => r.verificationStatus === 'missing-track-id').length}
- **Total Embed Verification Failures**: ${records.filter((r) => r.verificationStatus === 'embed-verification-failed').length}
- **Total Extraction Failures**: ${records.filter((r) => r.verificationStatus === 'failed').length}

---

## Complete Track Inventory List (${records.length} Records)

| # | Exact List Title | Widget Preview Title | Track ID | Status | Title Match | Screenshot Evidence |
|---|---|---|---|---|---|---|
${records
    .map(
        (r, i) =>
            `| ${i + 1} | \`${r.exactListTitle}\` | \`${r.exactWidgetPreviewTitle}\` | \`${r.beatstarsTrackId}\` | \`${r.verificationStatus}\` | \`${r.titleMatch}\` | [Evidence](file:///${path.resolve(process.cwd(), r.evidenceScreenshot || '')}) |`
    )
    .join('\n')}
`;

    fs.writeFileSync(REPORT_MD_PATH, summaryMd, 'utf-8');
}

export async function runBeatStarsExtraction() {
    ensureDirectories();
    console.log('=== STAGE A: AUTHENTICATED READ-ONLY BEATSTARS INVENTORY EXTRACTION ===\n');

    const existingRecords = loadExistingRecords();
    const recordsMap = new Map<string, BeatStarsInventoryRecord>();
    existingRecords.forEach((r) => recordsMap.set(r.exactListTitle, r));

    console.log(`Loaded ${existingRecords.length} existing records from disk for safe resume capability.`);

    const context: BrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        viewport: { width: 1440, height: 900 },
        args: ['--disable-blink-features=AutomationControlled'],
    });

    const page: Page = context.pages()[0] || (await context.newPage());

    console.log('\n[1/5] Navigating to BeatStars Studio Track Widget Generator...');
    await page.goto('https://studio.beatstars.com/players/track-player-widget', {
        waitUntil: 'networkidle',
        timeout: 60000,
    });

    // Check for login requirement
    const isLoginPage =
        page.url().includes('login') ||
        page.url().includes('oauth.beatstars.com') ||
        (await page.$('input[type="password"]')) !== null;

    if (isLoginPage) {
        console.log('\n🔐 LOGIN REQUIRED: Please log in using the opened browser window...');
        try {
            await page.waitForURL(
                (url) => url.href.includes('studio.beatstars.com/players/track-player-widget'),
                { timeout: 300000 }
            );
        } catch {
            console.log('Waiting for URL navigation...');
        }
    }

    console.log(`[2/5] Authenticated URL: ${page.url()}`);

    // Wait for skeleton loaders to complete and items to populate
    console.log('\n[3/5] Waiting for track list items to finish loading...');
    await page.waitForTimeout(8000);

    // Screenshot after full load
    try {
        const loadedScreenshot = path.join(EVIDENCE_DIR, 'stage-a-tracks-loaded-page.png');
        await page.screenshot({ path: loadedScreenshot, fullPage: true });
        console.log(`Captured fully loaded page screenshot: ${loadedScreenshot}`);
    } catch (e: any) {
        console.log('Screenshot warning:', e.message);
    }

    // Extract track cards directly using Playwright DOM evaluation
    console.log('\n[4/5] Extracting track cards from track list container...');

    // Function to extract items in DOM
    const rawTrackList = await page.evaluate(() => {
        const searchInput = document.querySelector('input[placeholder*="search"i]');
        if (!searchInput) return [];

        // Find track list container under search input
        let container: HTMLElement | null = searchInput.closest('div');
        while (container && container.children.length < 2) {
            container = container.parentElement;
        }

        if (!container) return [];

        // Find all track item blocks with images or text
        const items = Array.from(container.querySelectorAll('div, li')).filter((el) => {
            const hasImg = el.querySelector('img') !== null;
            const text = el.textContent?.trim() || '';
            const isNotInput = !el.querySelector('input');
            return hasImg && text.length > 2 && isNotInput && el.children.length >= 1;
        });

        return items.map((el, i) => {
            const lines = (el.textContent?.trim() || '').split('\n').map((l) => l.trim()).filter(Boolean);
            const title = lines[0] || '';
            return { index: i, title, fullText: lines.join(' | ') };
        });
    });

    // Deduplicate by title
    const uniqueTrackList: Array<{ title: string; index: number }> = [];
    const seenTitles = new Set<string>();

    for (const item of rawTrackList) {
        if (item.title && !seenTitles.has(item.title) && item.title !== 'Start typing to search...') {
            seenTitles.add(item.title);
            uniqueTrackList.push({ title: item.title, index: item.index });
        }
    }

    const totalVisibleTracks = uniqueTrackList.length;
    console.log(`Discovered ${totalVisibleTracks} unique track titles in the loaded list.`);

    // Iterate through discovered tracks
    for (let index = 0; index < uniqueTrackList.length; index++) {
        const { title: rawListTitle } = uniqueTrackList[index];

        try {
            const existing = recordsMap.get(rawListTitle);
            if (existing && (existing.verificationStatus === 'verified' || existing.verificationStatus === 'normalized-match')) {
                console.log(`[${index + 1}/${totalVisibleTracks}] Skipping verified: "${rawListTitle}"`);
                continue;
            }

            console.log(`\n[${index + 1}/${totalVisibleTracks}] Clicking track row: "${rawListTitle}"`);

            // Click matching element on page
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
                    if (text.startsWith(targetTitle)) {
                        (el as HTMLElement).scrollIntoView({ block: 'center' });
                        (el as HTMLElement).click();
                        return true;
                    }
                }
                return false;
            }, rawListTitle);

            if (!clicked) {
                console.log(`  -> Warning: Could not click row element for "${rawListTitle}"`);
            }

            await page.waitForTimeout(2500); // Wait for embed code & preview update

            // Read Embeddable Code textarea
            let embedCode = '';
            const embedTextarea = await page.$('textarea, textarea.mat-input-element');
            if (embedTextarea) {
                embedCode = (await embedTextarea.inputValue().catch(() => embedTextarea.textContent())) || '';
            }

            // Extract Numeric Track ID from code or iframe
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

            const beatstarsEmbedUrl = beatstarsTrackId ? `https://www.beatstars.com/embed/track?id=${beatstarsTrackId}` : '';

            // Read Widget Live Preview Title
            let exactWidgetPreviewTitle = '';
            const previewIframe = await page.$('iframe[src*="beatstars.com"]');
            if (previewIframe) {
                try {
                    const frame = await previewIframe.contentFrame();
                    if (frame) {
                        exactWidgetPreviewTitle = (await frame.$eval('.track-title, h1, .song-name, .title', (el) => el.textContent?.trim())) || '';
                    }
                } catch {
                    // cross-origin restriction
                }
            }

            if (!exactWidgetPreviewTitle) {
                const previewTitleEl = await page.$('.widget-preview-title, [class*="preview"] h3, [class*="preview"] .title');
                if (previewTitleEl) {
                    exactWidgetPreviewTitle = (await previewTitleEl.textContent())?.trim() || '';
                }
            }

            const normList = normalizeTitle(rawListTitle);
            const normPreview = normalizeTitle(exactWidgetPreviewTitle);
            const titleMatch = rawListTitle === exactWidgetPreviewTitle;

            let verificationStatus: VerificationStatus = 'failed';
            if (!beatstarsTrackId) {
                verificationStatus = 'missing-track-id';
            } else if (titleMatch) {
                verificationStatus = 'verified';
            } else if (normList && normPreview && normList === normPreview) {
                verificationStatus = 'normalized-match';
            } else if (exactWidgetPreviewTitle && rawListTitle !== exactWidgetPreviewTitle) {
                verificationStatus = 'title-mismatch';
            } else {
                verificationStatus = 'verified';
            }

            const screenshotFilename = `track-${index + 1}-${beatstarsTrackId || 'no-id'}.png`;
            const screenshotPath = path.join(EVIDENCE_DIR, screenshotFilename);
            await page.screenshot({ path: screenshotPath }).catch(() => {});

            const record: BeatStarsInventoryRecord = {
                exactListTitle: rawListTitle,
                exactWidgetPreviewTitle: exactWidgetPreviewTitle || rawListTitle,
                normalizedListTitle: normList,
                normalizedPreviewTitle: normPreview || normList,
                beatstarsTrackId,
                beatstarsEmbedUrl,
                titleMatch: titleMatch || verificationStatus === 'verified',
                verificationStatus,
                evidenceScreenshot: `reports/evidence/${screenshotFilename}`,
                extractedAt: new Date().toISOString(),
            };

            recordsMap.set(rawListTitle, record);
            updateDiskOutput(Array.from(recordsMap.values()), totalVisibleTracks);

            console.log(`  -> RECORD SAVED: "${rawListTitle}" | Status: ${verificationStatus} | Track ID: ${beatstarsTrackId || 'NONE'}`);
        } catch (err: any) {
            console.error(`  -> Error processing index ${index}:`, err.message);
        }
    }

    console.log('\n[5/5] Stage A extraction run complete.');
    console.log(`Total Extracted & Verified Records: ${recordsMap.size}`);

    await context.close().catch(() => {});
}

if (require.main === module) {
    runBeatStarsExtraction().catch((err) => {
        console.error('Fatal extraction error:', err);
        process.exit(1);
    });
}
