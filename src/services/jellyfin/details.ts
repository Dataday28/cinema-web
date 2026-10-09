import {
    getLibraryApi,
} from '@jellyfin/sdk/lib/utils/api/library-api';

import type {
    MediaDetailsData,
} from '../../types/media';

import {
    createJellyfinApi,
} from './client';

import {
    mapMediaItem,
} from './mappers';

import {
    getImageUrl,
} from './images';

interface DetailsRequest {
    accessToken: string;
    userId: string;
}

export async function getMediaDetails(
    itemId: string,
    {
        accessToken,
        userId,
    }: DetailsRequest
): Promise<MediaDetailsData> {

    const api =
        createJellyfinApi(accessToken);

    const userLibraryApi =
        getLibraryApi(api);

    const response =
        await userLibraryApi.getItem({
            userId,
            itemId,
        });

    const item = response.data;

    const base =
        mapMediaItem(item);

    const people =
        (item.People ?? []).map(
            (person) => ({
                id:
                    person.Id ??
                    undefined,

                name:
                    person.Name ??
                    'Desconocido',

                role:
                    person.Role ??
                    undefined,

                type:
                    person.Type ??
                    undefined,

                image:
                    person.Id
                        ? getImageUrl(
                            person.Id,
                            'Primary',
                            {
                                width: 300,
                                quality: 85,
                            }
                        )
                        : undefined,
            })
        );

    return {
        ...base,

        tagline:
            item.Taglines?.[0] ??
            undefined,

        officialRating:
            item.OfficialRating ??
            undefined,

        studios:
            item.Studios
                ?.map(
                    (studio) =>
                        studio.Name
                )
                .filter(
                    (name): name is string =>
                        Boolean(name)
                ) ?? [],

        people,

        directors:
            people.filter(
                (person) =>
                    person.type === 'Director'
            ),

        writers:
            people.filter(
                (person) =>
                    person.type === 'Writer'
            ),
    };
}