import {
    getLibraryApi,
} from '@jellyfin/sdk/lib/utils/api/library-api';

import {
    BaseItemKind,
    ItemFields,
} from '@jellyfin/sdk/lib/generated-client/models';

import type {
    MediaItem,
} from '../../types/media';

import {
    createJellyfinApi,
} from './client';

import {
    mapMediaItem,
} from './mappers';

interface JellyfinRequest {
    accessToken: string;
    userId: string;
}

export async function getMovies({
    accessToken,
    userId,
}: JellyfinRequest): Promise<MediaItem[]> {

    const api =
        createJellyfinApi(accessToken);

    const libraryApi =
        getLibraryApi(api);

    const response =
        await libraryApi.getItems({
            userId,

            includeItemTypes: [
                BaseItemKind.Movie,
            ],

            recursive: true,

            enableImages: true,
            enableUserData: true,

            fields: [
                ItemFields.Overview,
                ItemFields.Genres,
                ItemFields.MediaStreams,
            ],

            sortBy: [
                'SortName',
            ],

            sortOrder: [
                'Ascending',
            ],

            limit: 50,
        });

    console.log(response.data)

    return (response.data.Items ?? [])
        .map(mapMediaItem);
}

export async function getSeries({
    accessToken,
    userId,
}: JellyfinRequest): Promise<MediaItem[]> {

    const api =
        createJellyfinApi(accessToken);

    const response =
        await getLibraryApi(api)
            .getItems({
                userId,

                includeItemTypes: [
                    BaseItemKind.Series,
                ],

                recursive: true,

                enableImages: true,
                enableUserData: true,

                fields: [
                    ItemFields.Overview,
                    ItemFields.Genres,
                ],

                sortBy: [
                    'SortName',
                ],

                sortOrder: [
                    'Ascending',
                ],

                limit: 50,
            });

    return (response.data.Items ?? [])
        .map(mapMediaItem);
}

export async function getContinueWatching({
    accessToken,
    userId,
}: JellyfinRequest): Promise<MediaItem[]> {

    const api =
        createJellyfinApi(accessToken);

    const response =
        await getLibraryApi(api)
            .getResumeItems({
                userId,

                limit: 20,

                includeItemTypes: [
                    BaseItemKind.Movie,
                    BaseItemKind.Episode,
                ],

                enableImages: true,
                enableUserData: true,

                fields: [
                    ItemFields.Overview,
                    ItemFields.Genres,
                ],
            });
    
    console.log('Continue Watching Response:', response.data);

    return (response.data.Items ?? [])
        .map(mapMediaItem);
}

export async function getRecentlyAdded({
    accessToken,
    userId,
}: JellyfinRequest): Promise<MediaItem[]> {

    const api =
        createJellyfinApi(accessToken);

    const response =
        await getLibraryApi(api)
            .getLatestMedia({
                userId,

                includeItemTypes: [
                    BaseItemKind.Movie,
                    BaseItemKind.Series,
                ],

                enableImages: true,
                enableUserData: true,

                limit: 20,

                fields: [
                    ItemFields.Overview,
                    ItemFields.Genres,
                ],
            });

    return response.data
        .map(mapMediaItem);
}