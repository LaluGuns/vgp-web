import { NextResponse } from 'next/server';

const BEATSTARS_GRAPHQL_URL = 'https://core.prod.beatstars.net/graphql?op=getNewTrackV3';
const VIRZY_GUNS_USERNAME = 'virzyguns';

const TRACK_QUERY = `
    query getNewTrackV3($id: String!) {
        track(id: $id) {
            id
            title
            streamUrl
            bundle {
                stream { url duration }
                hls { url duration }
            }
            profile { username }
        }
    }
`;

interface BeatStarsTrackResponse {
    data?: {
        track?: {
            id?: string;
            title?: string;
            streamUrl?: string;
            bundle?: {
                stream?: { url?: string; duration?: number };
                hls?: { url?: string; duration?: number };
            };
            profile?: { username?: string };
        };
    };
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ trackId: string }> },
) {
    const { trackId } = await params;

    if (!/^\d{4,12}$/.test(trackId)) {
        return NextResponse.json({ error: 'Invalid track ID' }, { status: 400 });
    }

    try {
        const response = await fetch(BEATSTARS_GRAPHQL_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                operationName: 'getNewTrackV3',
                variables: { id: `TK${trackId}` },
                query: TRACK_QUERY,
            }),
            next: { revalidate: 86_400 },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'BeatStars preview unavailable' }, { status: 502 });
        }

        const payload = (await response.json()) as BeatStarsTrackResponse;
        const track = payload.data?.track;
        const previewUrl = track?.bundle?.stream?.url || track?.streamUrl;

        if (
            !track ||
            track.profile?.username?.toLowerCase() !== VIRZY_GUNS_USERNAME ||
            !previewUrl
        ) {
            return NextResponse.json({ error: 'Verified preview unavailable' }, { status: 404 });
        }

        return NextResponse.json(
            {
                title: track.title,
                previewUrl,
                duration: track.bundle?.stream?.duration || track.bundle?.hls?.duration || null,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
                },
            },
        );
    } catch {
        return NextResponse.json({ error: 'BeatStars preview unavailable' }, { status: 502 });
    }
}
