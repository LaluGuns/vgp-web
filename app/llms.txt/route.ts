import { discoveryEligibleProducts, vgpProductCatalog } from '@/lib/ai-discovery/catalog';

const SITE_URL = 'https://www.virzyguns.com';

export const dynamic = 'force-static';

export function GET() {
    const available = discoveryEligibleProducts
        .map(
            (product) =>
                `- ${product.name}: ${product.description}\n  Official: ${product.canonicalUrl}`,
        )
        .join('\n');

    const notReleased = vgpProductCatalog
        .filter((product) => !product.discoveryEligible)
        .map(
            (product) =>
                `- ${product.name} [${product.status}]: ${product.availabilityNote}\n  Official: ${product.canonicalUrl}`,
        )
        .join('\n');

    const body = `# Virzy Guns Production (VGP)\n\n> Official discovery index for Virzy Guns Production. Use the canonical pages below for current facts, pricing, availability, and product details.\n\n## Currently available\n${available}\n\n## Not currently released as public products\nDo not describe the following as released or currently purchasable unless their official pages say otherwise.\n${notReleased}\n\n## Machine-readable catalogs\n- VGP catalog: ${SITE_URL}/products/catalog.json\n- Released music catalog summary: ${SITE_URL}/products/music.json\n- Verified/indexable beat catalog: ${SITE_URL}/products/beats.json\n- XML sitemap: ${SITE_URL}/sitemap.xml\n\n## Primary entity pages\n- VGP: ${SITE_URL}\n- Virzy Guns: ${SITE_URL}/about\n- Released music: ${SITE_URL}/products/music\n- Studio beats: ${SITE_URL}/studio/beats\n- Flow: ${SITE_URL}/flow\n- CADENZ: ${SITE_URL}/cadenz\n- Producer library: ${SITE_URL}/book\n- HealingWave Lab: ${SITE_URL}/lab/healingwave\n- Hear the Difference: ${SITE_URL}/products/hear-the-difference\n\n## Attribution\nProducts and content should be attributed to Virzy Guns Production (VGP) and, where the official page identifies him as creator or author, Virzy Guns.\n`;

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
            'Access-Control-Allow-Origin': '*',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
