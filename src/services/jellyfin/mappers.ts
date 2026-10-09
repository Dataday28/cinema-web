import type {
    BaseItemDto,
} from '@jellyfin/sdk/lib/generated-client/models';

import type {
    MediaItem,
    MediaType,
} from '../../types/media';

import {
    getImageUrl,
} from './images';

export function mapMediaItem(
    item: BaseItemDto
): MediaItem {

    if (!item.Id) {
        throw new Error(
            'El elemento de Jellyfin no tiene Id'
        );
    }

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
        id: item.Type === 'Movie' || item.Type === 'Series'
            ? item.Id
            : item.SeriesId ?? item.Id,

        type: mapMediaType(item.Type),

        title:
            item.Name ??
            'Sin título',

        description:
            item.Overview ?? undefined,

        year:
            item.ProductionYear ??
            undefined,

        runtime:
            ticksToMinutes(
                item.RunTimeTicks
            ),

        image: getImageUrl(
            item.Id,
            'Primary',
            {
                width: 600,
                quality: 90,
            }
        ),

        landscape: getImageUrl(
            item.Type === 'Movie'
                ? item.Id
                : item.SeriesId ?? item.Id,
            'Thumb',
            {
                width: 1920,
                quality: 90,
            }
        ),

        backdrop: getImageUrl(
            item.Id,
            item.Type === 'Movie' || item.Type === 'Series'
                ? 'Backdrop'
                : 'Primary',
            {
                width: 1920,
                quality: 90,
            }
        ),

        logo: getImageUrl(
            item.Type === 'Movie'
                ? item.Id
                : item.SeriesId ?? item.Id,
            'Logo',
            {
                width: 600,
                quality: 90,
            }
        ),

        genres:
            item.Genres ?? [],

        rating:
            item.CommunityRating ??
            undefined,

        cast:
            people,

        progress:
            calculateProgress(item),
    };
}

function mapMediaType(
    type?: string | null
): MediaType {

    switch (type) {
        case 'Movie':
            return 'movie';

        case 'Series':
            return 'series';

        case 'Episode':
            return 'episode';

        default:
            return 'movie';
    }
}

function ticksToMinutes(
    ticks?: number | null
): number | undefined {

    if (!ticks) {
        return undefined;
    }

    // Jellyfin utiliza ticks de 100 ns.
    const seconds =
        ticks / 10_000_000;

    return Math.round(
        seconds / 60
    );
}

function calculateProgress(
    item: BaseItemDto
): number | undefined {

    const position =
        item.UserData?.PlaybackPositionTicks;

    const runtime =
        item.RunTimeTicks;

    if (
        !position ||
        !runtime
    ) {
        return undefined;
    }

    return Math.min(
        100,
        Math.round(
            (position / runtime) * 100
        )
    );
}