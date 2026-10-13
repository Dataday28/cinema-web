import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import { createJellyfinApi } from './client';

export interface TrailerInfo {
    id: string;
    name: string;
    provider: 'youtube';
    embedUrl: string;
}

interface GetTrailerRequest {
    itemId: string;
    userId: string;
    accessToken: string;
}

function getYouTubeVideoId(url: string): string | null {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();

        let id: string | null = null;

        if (
            host === 'youtube.com' ||
            host === 'www.youtube.com' ||
            host === 'm.youtube.com'
        ) {
            if (parsed.pathname === '/watch') {
                id = parsed.searchParams.get('v');
            } else {
                const match = parsed.pathname.match(
                    /^\/(?:embed|shorts|live)\/([^/]+)/
                );

                id = match?.[1] ?? null;
            }
        } else if (host === 'youtu.be' || host === 'www.youtu.be') {
            id = parsed.pathname.slice(1).split('/')[0];
        }

        return id && /^[a-zA-Z0-9_-]{11}$/.test(id)
            ? id
            : null;
    } catch {
        return null;
    }
}

export async function getMediaTrailers({
    itemId,
    userId,
    accessToken,
}: GetTrailerRequest): Promise<TrailerInfo[]> {
    const api = createJellyfinApi(accessToken);

    const response = await getLibraryApi(api).getItem({
        itemId,
        userId,
    });

    const remoteTrailers = response.data.RemoteTrailers ?? [];

    const trailers: TrailerInfo[] = [];
    const seen = new Set<string>();

    for (const trailer of remoteTrailers) {
        if (!trailer.Url) continue;

        const videoId = getYouTubeVideoId(trailer.Url);

        if (!videoId || seen.has(videoId)) continue;

        seen.add(videoId);

        const params = new URLSearchParams({
            autoplay: '1',
            mute: '1',
            controls: '0',
            playsinline: '1',
            rel: '0',
            enablejsapi: '1',
        });

        trailers.push({
            id: videoId,
            name: trailer.Name ?? 'Tráiler',
            provider: 'youtube',
            embedUrl:
                `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`,
        });
    }

    return trailers;
}