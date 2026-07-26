/**
 * Owner-supplied BeatStars endpoints. Keep these as the canonical integration
 * points so the store and individual track embeds never drift apart.
 */
export const beatStarsStoreUrl = 'https://www.beatstars.com/virzyguns/tracks';

export const beatStarsBlazePlayerUrl = 'https://player.beatstars.com/?storeId=122437';

/**
 * Blaze Player supports `trackId` as a first-class query parameter. Keeping
 * this URL builder here prevents the checkout modal from falling back to the
 * retired `/embed/track` shell.
 */
export function getBeatStarsBlazeTrackUrl(trackId: string, title?: string) {
    const url = new URL(beatStarsBlazePlayerUrl);
    url.searchParams.set('trackId', trackId);
    if (title) url.searchParams.set('search_keyword', title);
    return url.toString();
}
