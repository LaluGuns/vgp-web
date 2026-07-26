export type BeatStarsTrackData = {
    previewUrl?: string;
    duration?: number | null;
    artworkUrl?: string;
    description?: string;
    releaseDate?: string;
    price?: number;
    metadata: {
        bpm?: number;
        key?: string;
        genres: string[];
        tags: string[];
        free?: boolean;
        exclusive?: boolean;
    };
    activity: {
        plays?: number;
        purchases?: number;
        likes?: number;
    };
    contracts: Array<{
        title: string;
        price?: number;
        deliverables: string[];
        offerOnly?: boolean;
        isFeatured?: boolean;
        features: string[];
    }>;
};

type BeatStarsResponse = {
    data?: {
        track?: {
            streamUrl?: string;
            description?: string;
            releaseDate?: string;
            price?: number;
            profile?: { username?: string };
            bundle?: {
                stream?: { url?: string; duration?: number };
                hls?: { url?: string; duration?: number };
            };
            artwork?: { fitInUrl?: string; sizes?: { medium?: string; small?: string } };
            metadata?: {
                bpm?: number;
                keyNote?: { value?: string };
                genres?: Array<{ value?: string }>;
                tags?: string[];
                free?: boolean;
                exclusive?: boolean;
            };
            activities?: { play?: number; purchase?: number; like?: number };
            attachedContracts?: {
                content?: Array<{
                    title?: string;
                    price?: number;
                    deliverables?: string[];
                    offerOnly?: boolean;
                    isFeatured?: boolean;
                    features?: Array<{ textWithValue?: string; text?: string }>;
                }>;
            };
        };
    };
};

const BEATSTARS_GRAPHQL_URL = 'https://core.prod.beatstars.net/graphql?op=getNewTrackV3';
const VIRZY_GUNS_USERNAME = 'virzyguns';
const trackRequests = new Map<string, Promise<BeatStarsTrackData>>();

const TRACK_QUERY = `
    query getNewTrackV3($id: String!) {
        track(id: $id) {
            streamUrl
            description
            releaseDate
            price
            profile { username }
            bundle {
                stream { url duration }
                hls { url duration }
            }
            artwork {
                fitInUrl(width: 700, height: 700)
                sizes { medium small }
            }
            metadata {
                free
                exclusive
                tags
                bpm
                genres { value }
                keyNote { value }
            }
            activities { play purchase like }
            attachedContracts(page: 0, size: 1000) {
                content {
                    title
                    price
                    deliverables
                    offerOnly
                    isFeatured
                    features { text textWithValue }
                }
            }
        }
    }
`;

export function getBeatStarsTrack(trackId: string) {
    const cached = trackRequests.get(trackId);
    if (cached) return cached;

    const request = fetch(BEATSTARS_GRAPHQL_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            operationName: 'getNewTrackV3',
            variables: { id: `TK${trackId}` },
            query: TRACK_QUERY,
        }),
    })
        .then(async (response) => {
            if (!response.ok) throw new Error('BeatStars track request failed');

            const payload = (await response.json()) as BeatStarsResponse;
            const track = payload.data?.track;
            const previewUrl = track?.streamUrl || track?.bundle?.hls?.url || track?.bundle?.stream?.url;

            if (!track || track.profile?.username?.toLowerCase() !== VIRZY_GUNS_USERNAME || !previewUrl) {
                throw new Error('Verified BeatStars track unavailable');
            }

            return {
                previewUrl,
                duration: track.bundle?.hls?.duration || track.bundle?.stream?.duration || null,
                artworkUrl: track.artwork?.fitInUrl || track.artwork?.sizes?.medium || track.artwork?.sizes?.small,
                description: track.description,
                releaseDate: track.releaseDate,
                price: track.price,
                metadata: {
                    bpm: track.metadata?.bpm,
                    key: track.metadata?.keyNote?.value,
                    genres: track.metadata?.genres?.flatMap((genre) => genre.value ? [genre.value] : []) || [],
                    tags: track.metadata?.tags || [],
                    free: track.metadata?.free,
                    exclusive: track.metadata?.exclusive,
                },
                activity: {
                    plays: track.activities?.play,
                    purchases: track.activities?.purchase,
                    likes: track.activities?.like,
                },
                contracts: track.attachedContracts?.content?.flatMap((contract) => contract.title ? [{
                    title: contract.title,
                    price: contract.price,
                    deliverables: contract.deliverables || [],
                    offerOnly: contract.offerOnly,
                    isFeatured: contract.isFeatured,
                    features: contract.features?.flatMap((feature) => feature.textWithValue || feature.text ? [feature.textWithValue || feature.text || ''] : []) || [],
                }] : []) || [],
            } satisfies BeatStarsTrackData;
        })
        .catch((error) => {
            trackRequests.delete(trackId);
            throw error;
        });

    trackRequests.set(trackId, request);
    return request;
}

export function formatTrackTime(seconds?: number | null) {
    if (!Number.isFinite(seconds) || !seconds || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}
