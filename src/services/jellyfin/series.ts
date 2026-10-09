import {
    getShowApi,
} from '@jellyfin/sdk/lib/utils/api/show-api';

import {
    ItemFields,
    ImageType,
} from '@jellyfin/sdk/lib/generated-client/models';

import type {
    Episode,
    Season,
} from '../../types/media';

import {
    createJellyfinApi,
} from './client';

import {
    getImageUrl,
} from './images';

interface JellyfinSeriesRequest {
    accessToken: string;
    userId: string;
}

function ticksToMinutes(
    ticks?: number | null
): number | undefined {

    if (!ticks) {
        return undefined;
    }

    const seconds =
        ticks / 10_000_000;

    return Math.round(
        seconds / 60
    );
}

function calculateProgress(
    position?: number | null,
    runtime?: number | null
): number | undefined {

    if (!position || !runtime) {
        return undefined;
    }

    return Math.min(
        100,
        Math.round(
            (position / runtime) * 100
        )
    );
}

export async function getSeasons(
    seriesId: string,
    {
        accessToken,
        userId,
    }: JellyfinSeriesRequest
): Promise<Season[]> {

    const api =
        createJellyfinApi(accessToken);

    const showApi =
        getShowApi(api);

    const response =
        await showApi.getSeasons({
            seriesId,
            userId,

            enableImages: true,
            enableUserData: true,

            enableImageTypes: [
                ImageType.Primary,
            ],

            fields: [
                ItemFields.Overview,
            ],
        });

    return (response.data.Items ?? [])
        .filter((season) => season.Id)
        .map((season) => ({
            id: season.Id!,

            seriesId,

            seasonNumber:
                season.IndexNumber ?? 0,

            title:
                season.Name ??
                `Temporada ${season.IndexNumber ?? ''}`,

            image: season.Id
                ? getImageUrl(
                    season.Id,
                    'Primary',
                    {
                        width: 500,
                        quality: 90,
                    }
                )
                : undefined,
        }));
}

export async function getEpisodes(
    seriesId: string,
    seasonId: string,
    {
        accessToken,
        userId,
    }: JellyfinSeriesRequest
): Promise<Episode[]> {

    const api =
        createJellyfinApi(accessToken);

    const showApi =
        getShowApi(api);

    const response =
        await showApi.getEpisodes({
            seriesId,
            seasonId,
            userId,

            enableImages: true,
            enableUserData: true,

            enableImageTypes: [
                ImageType.Primary,
            ],

            fields: [
                ItemFields.Overview,
            ],
        });

    return (response.data.Items ?? [])
        .filter((episode) => episode.Id)
        .map((episode) => ({
            id: episode.Id!,

            seriesId,
            seasonId,

            seasonNumber:
                episode.ParentIndexNumber ?? 0,

            episodeNumber:
                episode.IndexNumber ?? 0,

            title:
                episode.Name ??
                `Episodio ${episode.IndexNumber ?? ''}`,

            description:
                episode.Overview ??
                undefined,

            image:
                episode.Id
                    ? getImageUrl(
                        episode.Id,
                        'Primary',
                        {
                            width: 600,
                            quality: 90,
                        }
                    )
                    : undefined,

            runtime:
                ticksToMinutes(
                    episode.RunTimeTicks
                ),

            progress:
                calculateProgress(
                    episode.UserData?.PlaybackPositionTicks,
                    episode.RunTimeTicks
                ),

            watched:
                episode.UserData?.Played ??
                false,
        }));
}