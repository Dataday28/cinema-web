import { getMediaInfoApi } from '@jellyfin/sdk/lib/utils/api/media-info-api';
import { createJellyfinApi, getJellyfinUrl } from './client';
import { createWebDeviceProfile } from './deviceProfile';

interface PreviewRequest {
    itemId: string;
    accessToken: string;
    userId: string;
}

export interface PreviewSource {
    url: string;
    mediaSourceId: string;
    container?: string;
    videoCodec?: string;
}

const SUPPORTED_CONTAINERS = new Set([
    'mp4',
    'm4v',
    'mov',
    'webm',
]);

export async function getPreviewSource({
    itemId,
    accessToken,
    userId,
}: PreviewRequest): Promise<PreviewSource | null> {
    const api = createJellyfinApi(accessToken);
    const mediaInfoApi = getMediaInfoApi(api);

    const response = await mediaInfoApi.getPostedPlaybackInfo({
        itemId,
        userId,
        playbackInfoDto: {
            UserId: userId,
            DeviceProfile: createWebDeviceProfile(),

            EnableDirectPlay: true,
            EnableDirectStream: false,
            EnableTranscoding: false,
        },
    });

    const mediaSources = response.data.MediaSources ?? [];

    const mediaSource = mediaSources.find((source) => {
        if (!source.Id || !source.SupportsDirectPlay) {
            return false;
        }

        const container = source.Container?.toLowerCase();

        return Boolean(
            container &&
            SUPPORTED_CONTAINERS.has(container)
        );
    });

    if (!mediaSource?.Id) {
        return null;
    }

    const videoStream = mediaSource.MediaStreams?.find(
        (stream) => stream.Type === 'Video'
    );

    const url = new URL(
        `/Videos/${encodeURIComponent(itemId)}/stream`,
        getJellyfinUrl()
    );

    url.searchParams.set('static', 'true');
    url.searchParams.set('mediaSourceId', mediaSource.Id);
    url.searchParams.set('api_key', accessToken);

    return {
        url: url.toString(),
        mediaSourceId: mediaSource.Id,
        container: mediaSource.Container ?? undefined,
        videoCodec: videoStream?.Codec ?? undefined,
    };
}