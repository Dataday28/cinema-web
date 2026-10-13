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

import { getGenreApi } from '@jellyfin/sdk/lib/utils/api/genre-api';

interface JellyfinRequest {
    accessToken: string;
    userId: string;
}

export interface GenreMediaRequest extends JellyfinRequest {
    genreId: string;
    startIndex?: number;
    limit?: number;
}

export interface MediaPage {
    items: MediaItem[];
    totalCount: number;
}

export interface JellyfinGenre {
    id: string;
    name: string;
}

export async function getMediaByGenre({
    accessToken,
    userId,
    genreId,
    startIndex = 0,
    limit = 20,
}: GenreMediaRequest): Promise<MediaPage> {
    const api = createJellyfinApi(accessToken);

    const response = await getLibraryApi(api).getItems({
        userId,

        recursive: true,

        includeItemTypes: [
            BaseItemKind.Movie,
            BaseItemKind.Series,
        ],

        genreIds: [genreId],

        startIndex,
        limit,

        enableImages: true,
        enableUserData: true,

        fields: [
            ItemFields.Overview,
            ItemFields.Genres,
        ],

        sortBy: ['SortName'],
        sortOrder: ['Ascending'],
    });

    return {
        items: (response.data.Items ?? []).map(mapMediaItem),
        totalCount: response.data.TotalRecordCount ?? 0,
    };
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

    // console.log(response.data)

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
    
    // console.log('Continue Watching Response:', response.data);

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

export async function getGenres({
    accessToken,
    userId,
}: JellyfinRequest): Promise<JellyfinGenre[]> {
    const api = createJellyfinApi(accessToken);

    const response = await getGenreApi(api).getGenres({
        userId,
        includeItemTypes: [
            BaseItemKind.Movie,
            BaseItemKind.Series,
        ],
    });

    return (response.data.Items ?? [])
        .filter((genre) => genre.Id && genre.Name)
        .map((genre) => ({
            id: genre.Id!,
            name: genre.Name!,
        }));
}