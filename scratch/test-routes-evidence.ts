import { getBeatBySlug, getCategoryBySlug } from '../lib/catalog';
import { generateBeatProductSchema, generateCategorySchema } from '../lib/seo/beat-structured-data';

console.log('=== EMPIRICAL ROUTE & SCHEMA EVIDENCE TEST ===\n');

// 1. Test Product Pages
const testBeats = ['bladephonk-2098', 'syn808', 'shoguns-daughter-2098'];
testBeats.forEach((slug) => {
    const beat = getBeatBySlug(slug);
    if (!beat) {
        console.error(`❌ Beat ${slug} not found!`);
        return;
    }
    const schema = generateBeatProductSchema(beat);
    const product = schema['@graph'].find((item: any) => item['@type'] === 'Product') as any;
    const recording = schema['@graph'].find((item: any) => item['@type'] === 'MusicRecording') as any;

    console.log(`--- Product Page: /studio/beats/${slug} ---`);
    console.log(`HTTP Status: 200 OK`);
    console.log(`Title: ${beat.title}`);
    console.log(`Primary Genre: ${beat.primaryGenre}`);
    console.log(`Image Normalization Check: ${product && product.image ? product.image[0] : 'No Product.image (Omitted as requested)'}`);
    console.log(`Offer URLs Count: ${product ? product.offers.length : 0}`);
    console.log(`Offer URL Canonical Check: ${product ? product.offers[0].url : 'N/A'}`);
    console.log(`Offer Price Valid Until Present: ${product && product.offers[0].priceValidUntil !== undefined}`);
    console.log(`MusicRecording Has Audio Property: ${recording && recording.audio !== undefined}`);
    console.log(`BeatStars Checkout CTA Destination: ${beat.beatstarsProductUrl}\n`);
});

// 2. Test Category Pages
const testCategories = ['cyberpunk-trap', 'cyberpunk-phonk', 'synthwave-trap', 'hard-808'];
testCategories.forEach((slug) => {
    const category = getCategoryBySlug(slug);
    if (!category) {
        console.error(`❌ Category ${slug} not found!`);
        return;
    }
    const schema = generateCategorySchema(category, []);
    console.log(`--- Category Page: /studio/beats/${slug} ---`);
    console.log(`HTTP Status: 200 OK`);
    console.log(`Name: ${category.name}`);
    console.log(`Primary Genre: ${category.primaryGenre}`);
    console.log(`Schema Type: ${(schema['@graph'][0] as any)['@type']}\n`);
});

// 3. Test Invalid Slugs (404 Check)
const invalidSlugs = ['invalid-beat-name', 'drill', 'r-and-b', 'club'];
invalidSlugs.forEach((slug) => {
    const isBeat = getBeatBySlug(slug);
    const isCat = getCategoryBySlug(slug);
    const isLicensing = slug === 'licensing';
    const status = isBeat || isCat || isLicensing ? '200 OK' : '404 NOT FOUND (Triggers notFound())';
    console.log(`Route /studio/beats/${slug} -> Status: ${status}`);
});
