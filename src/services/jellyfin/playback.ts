import { getMediaInfoApi } from '@jellyfin/sdk/lib/utils/api/media-info-api';
import { createJellyfinApi, getJellyfinUrl } from './client';
import type { PlaybackMethod, PlaybackSession, TrickplayInfo } from '../../types/playback';
import { getLibraryApi } from '@jellyfin/sdk/lib/utils/api/library-api';
import { getSessionApi } from '@jellyfin/sdk/lib/utils/api/session-api';
import { PlayMethod, type MediaSourceInfo } from '@jellyfin/sdk/lib/generated-client/models';
import { createWebDeviceProfile } from './deviceProfile';

interface PlaybackRequest {
    accessToken: string;
    userId: string;
    audioStreamIndex?: number;
    subtitleStreamIndex?: number;
    mediaSourceId?: string;
}

interface PlaybackReport {
    accessToken: string;
    itemId: string;
    mediaSourceId: string;
    playSessionId?: string;
    positionTicks: number;
    isPaused?: boolean;
    method: PlaybackMethod;
}

function buildDirectStreamUrl(
    itemId: string,
    mediaSourceId: string,
    accessToken: string
) {

    const params =
        new URLSearchParams({
            static: 'true',

            mediaSourceId,

            api_key: accessToken,
        });

    return (
        `${getJellyfinUrl()}` +
        `/Videos/${itemId}/stream` +
        `?${params.toString()}`
    );
}

export async function getPlaybackSession(
    itemId: string,
    {
        accessToken,
        userId,
        audioStreamIndex,
        subtitleStreamIndex,
        mediaSourceId
    }: PlaybackRequest
): Promise<PlaybackSession> {

    const api = createJellyfinApi(accessToken);
    const mediaInfoApi = getMediaInfoApi(api);
    const userLibraryApi = getLibraryApi(api);

    const [playbackResponse, itemResponse] = await Promise.all([
        mediaInfoApi.getPostedPlaybackInfo({
            itemId,
            userId,

            mediaSourceId,
            audioStreamIndex,
            subtitleStreamIndex,

            playbackInfoDto: {
                UserId: userId,
                MediaSourceId: mediaSourceId,
                AudioStreamIndex: audioStreamIndex,
                SubtitleStreamIndex: subtitleStreamIndex,
                DeviceProfile: createWebDeviceProfile(),

                EnableDirectPlay: true,
                EnableDirectStream: true,
                EnableTranscoding: true,

                AllowVideoStreamCopy: true,
                AllowAudioStreamCopy: true,
            },
        }),

        userLibraryApi.getItem({
            itemId,
            userId,
        }),
    ]);

    const playbackInfo = playbackResponse.data;

    console.log(
        'Playback request:',
        playbackResponse.config.url
    );

    console.log(
        'Playback request params:',
        playbackResponse.config.params
    );

    console.log(
        'Playback request body:',
        playbackResponse.config.data
    );

    const item = itemResponse.data;
    const mediaSource = playbackInfo.MediaSources?.[0];

    console.log(
        'Audio solicitado:',
        audioStreamIndex
    );

    console.log(
        'TranscodingUrl:',
        mediaSource?.TranscodingUrl
    );

    if (!mediaSource?.Id) {
        throw new Error(
            'Jellyfin no devolvió una fuente de reproducción'
        );
    }

    const trickplaySource =
        item.Trickplay?.[
        mediaSource.Id ?? ''
        ];

    const trickplayEntry =
        trickplaySource
            ? trickplaySource['320'] ??
            Object.values(
                trickplaySource
            )[0]
            : undefined;

    const resolved = resolvePlayback(
        itemId,
        mediaSource,
        accessToken
    );

    const videoStream = mediaSource.MediaStreams?.find(
        stream =>
            stream.Type === 'Video'
    );

    const audioStream = mediaSource.MediaStreams?.find(
        stream =>
            stream.Type === 'Audio'
    );

    const audioTracks =
        mediaSource.MediaStreams
            ?.filter(
                stream =>
                    stream.Type === 'Audio'
            )
            .map(stream => ({
                index: stream.Index ?? 0,

                codec:
                    stream.Codec ??
                    undefined,

                language:
                    stream.Language ??
                    undefined,

                title:
                    stream.DisplayTitle ??
                    stream.Title ??
                    undefined,

                channels:
                    stream.Channels ??
                    undefined,

                isDefault:
                    stream.IsDefault ??
                    false,
            })) ?? [];

    const subtitleTracks =
        mediaSource.MediaStreams
            ?.filter(
                stream =>
                    stream.Type === 'Subtitle'
            )
            .map(stream => ({
                index:
                    stream.Index ?? 0,

                codec:
                    stream.Codec ??
                    undefined,

                language:
                    stream.Language ??
                    undefined,

                title:
                    stream.DisplayTitle ??
                    stream.Title ??
                    undefined,

                isDefault:
                    stream.IsDefault ??
                    false,

                isForced:
                    stream.IsForced ??
                    false,

                isExternal:
                    stream.IsExternal ??
                    false,

                deliveryMethod:
                    stream.DeliveryMethod ??
                    undefined,

                deliveryUrl:
                    stream.DeliveryUrl ??
                    undefined,
            })) ?? [];

    const trickplay:
        TrickplayInfo | undefined =
        trickplayEntry &&
            typeof trickplayEntry.Width === 'number' &&
            typeof trickplayEntry.Height === 'number' &&
            typeof trickplayEntry.TileWidth === 'number' &&
            typeof trickplayEntry.TileHeight === 'number' &&
            typeof trickplayEntry.ThumbnailCount === 'number' &&
            typeof trickplayEntry.Interval === 'number'
            ? {
                width:
                    trickplayEntry.Width,

                height:
                    trickplayEntry.Height,

                tileWidth:
                    trickplayEntry.TileWidth,

                tileHeight:
                    trickplayEntry.TileHeight,

                thumbnailCount:
                    trickplayEntry
                        .ThumbnailCount,

                interval:
                    trickplayEntry.Interval,

                bandwidth:
                    trickplayEntry.Bandwidth,
            }
            : undefined;

    // console.table({
    //     supportsDirectPlay:
    //         mediaSource.SupportsDirectPlay,

    //     supportsDirectStream:
    //         mediaSource.SupportsDirectStream,

    //     transcodingUrl:
    //         mediaSource.TranscodingUrl,

    //     transcodingContainer:
    //         mediaSource.TranscodingContainer,

    //     transcodingSubProtocol:
    //         mediaSource.TranscodingSubProtocol,

    //     container:
    //         mediaSource.Container,

    //     method:
    //         resolved.method,
    // });

    // console.table(
    //     mediaSource.MediaStreams?.map(
    //         stream => ({
    //             type: stream.Type,
    //             codec: stream.Codec,
    //             language: stream.Language,
    //             channels: stream.Channels,
    //             index: stream.Index,
    //         })
    //     )
    // );

    // console.table(
    //     mediaSource.MediaStreams
    //         ?.filter(
    //             stream =>
    //                 stream.Type === 'Subtitle'
    //         )
    //         .map(stream => ({
    //             index:
    //                 stream.Index,

    //             codec:
    //                 stream.Codec,

    //             language:
    //                 stream.Language,

    //             title:
    //                 stream.DisplayTitle,

    //             isExternal:
    //                 stream.IsExternal,

    //             isText:
    //                 stream.IsTextSubtitleStream,

    //             deliveryMethod:
    //                 stream.DeliveryMethod,

    //             deliveryUrl:
    //                 stream.DeliveryUrl,

    //             supportsExternalStream:
    //                 stream.SupportsExternalStream,
    //         }))
    // );

    return {
        itemId,
        mediaSourceId: mediaSource.Id,
        playSessionId: playbackInfo.PlaySessionId ?? undefined,
        streamUrl: resolved.url,
        method: resolved.method,
        runtimeTicks: mediaSource.RunTimeTicks ?? undefined,
        startPositionTicks: item.UserData?.PlaybackPositionTicks ?? 0,
        container: mediaSource.Container ?? undefined,
        videoCodec: videoStream?.Codec ?? undefined,
        audioCodec: audioStream?.Codec ?? undefined,
        isHls: resolved.isHls,
        audioTracks,
        selectedAudioStreamIndex:
            audioStreamIndex ??
            mediaSource.DefaultAudioStreamIndex ??
            audioTracks[0]?.index,
        subtitleTracks: subtitleTracks,
        selectedSubtitleStreamIndex: subtitleStreamIndex,
        title: item.Name ?? 'Reproduciendo',
        seriesName: item.SeriesName ?? undefined,
        seasonName: item.SeasonName ?? undefined,
        episodeNumber: item.IndexNumber ?? undefined,
        trickplay: trickplay,
    };
}

export async function reportPlaybackStart({
    accessToken,
    itemId,
    mediaSourceId,
    playSessionId,
    positionTicks,
    method
}: PlaybackReport): Promise<void> {

    const api = createJellyfinApi(accessToken);
    const sessionApi = getSessionApi(api);

    await sessionApi.reportPlaybackStart({
        playbackStartInfo: {
            ItemId: itemId,
            MediaSourceId: mediaSourceId,
            PlaySessionId: playSessionId,
            PositionTicks: positionTicks,
            CanSeek: true,
            IsPaused: false,
            PlayMethod: getPlayMethod(method),
        },
    });
}

export async function reportPlaybackProgress({
    accessToken,
    itemId,
    mediaSourceId,
    playSessionId,
    positionTicks,
    isPaused = false,
    method
}: PlaybackReport): Promise<void> {

    const api = createJellyfinApi(accessToken);
    const sessionApi = getSessionApi(api);

    await sessionApi.reportPlaybackProgress({
        playbackProgressInfo: {
            ItemId: itemId,
            MediaSourceId: mediaSourceId,
            PlaySessionId: playSessionId,
            PositionTicks: positionTicks,
            CanSeek: true,
            IsPaused: isPaused,
            PlayMethod: getPlayMethod(method),
        },
    });
}

export async function reportPlaybackStopped({
    accessToken,
    itemId,
    mediaSourceId,
    playSessionId,
    positionTicks,
}: PlaybackReport): Promise<void> {

    const api =
        createJellyfinApi(accessToken);

    const sessionApi =
        getSessionApi(api);

    await sessionApi.reportPlaybackStopped({
        playbackStopInfo: {
            ItemId:
                itemId,

            MediaSourceId:
                mediaSourceId,

            PlaySessionId:
                playSessionId,

            PositionTicks:
                positionTicks,
        },
    });
}

function resolvePlayback(
    itemId: string,
    mediaSource: MediaSourceInfo,
    accessToken: string
): {
    url: string;
    method: PlaybackMethod;
    isHls: boolean;
} {
    if (mediaSource.SupportsDirectPlay) {
        return {
            method: 'DirectPlay',

            url: buildDirectStreamUrl(
                itemId,
                mediaSource.Id!,
                accessToken
            ),

            isHls: false,
        };
    }

    if (!mediaSource.TranscodingUrl) {
        throw new Error(
            'Jellyfin no devolvió una URL compatible'
        );
    }

    const url =
        buildTranscodingUrl(
            mediaSource.TranscodingUrl,
            accessToken
        );

    const isHls =
        mediaSource.TranscodingSubProtocol
            ?.toLowerCase() === 'hls' ||
        url.includes('.m3u8');

    return {
        method:
            mediaSource.SupportsDirectStream
                ? 'DirectStream'
                : 'Transcode',

        url,
        isHls,
    };
}

function buildTranscodingUrl(
    transcodingUrl: string,
    accessToken: string
) {

    const baseUrl =
        getJellyfinUrl();

    const url =
        new URL(
            transcodingUrl,
            baseUrl
        );

    url.searchParams.set(
        'api_key',
        accessToken
    );

    return url.toString();
}

function getPlayMethod(
    method: PlaybackMethod
): PlayMethod {

    switch (method) {

        case 'DirectPlay':
            return PlayMethod.DirectPlay;

        case 'DirectStream':
            return PlayMethod.DirectStream;

        case 'Transcode':
            return PlayMethod.Transcode;
    }
}

export function getSubtitleUrl(
    deliveryUrl: string
): string {
    return new URL(
        deliveryUrl,
        getJellyfinUrl()
    ).toString();
}

export async function getSubtitleBlobUrl(
    deliveryUrl: string,
    accessToken: string
): Promise<string> {

    const url =
        new URL(
            deliveryUrl,
            getJellyfinUrl()
        );

    const response =
        await fetch(
            url.toString(),
            {
                headers: {
                    Authorization:
                        `MediaBrowser Token="${accessToken}"`,
                },
            }
        );

    if (!response.ok) {
        throw new Error(
            `No se pudo descargar el subtítulo: ${response.status}`
        );
    }

    const content =
        await response.text();

    const blob =
        new Blob(
            [content],
            {
                type: 'text/vtt',
            }
        );

    console.log(
        'Descargando subtítulo:',
        url.toString()
    );

    console.log(
        'Subtitle status:',
        response.status
    );

    console.log(
        'Subtitle content:',
        content.slice(0, 200)
    );

    return URL.createObjectURL(
        blob
    );
}