import {
    getTrickPlayApi
} from '@jellyfin/sdk/lib/utils/api/trick-play-api';

import {
    createJellyfinApi
} from './client';
import type { TrickplayInfo } from '../../types/playback';

export interface TrickplayPosition {
    thumbnailIndex: number;
    tileIndex: number;

    row: number;
    column: number;
}

export function getTrickplayPosition(
    timeSeconds: number,
    trickplay: TrickplayInfo
): TrickplayPosition {
    const timeMs =
        timeSeconds * 1000;

    const rawThumbnailIndex =
        Math.floor(
            timeMs /
            trickplay.interval
        );

    const thumbnailIndex =
        Math.min(
            Math.max(
                rawThumbnailIndex,
                0
            ),
            trickplay.thumbnailCount - 1
        );

    const imagesPerTile =
        trickplay.tileWidth *
        trickplay.tileHeight;

    const tileIndex =
        Math.floor(
            thumbnailIndex /
            imagesPerTile
        );

    const indexInTile =
        thumbnailIndex %
        imagesPerTile;

    const column =
        indexInTile %
        trickplay.tileWidth;

    const row =
        Math.floor(
            indexInTile /
            trickplay.tileWidth
        );

    return {
        thumbnailIndex,
        tileIndex,
        row,
        column,
    };
}

export async function getTrickplayTile(
    itemId: string,
    accessToken: string,
    mediaSourceId: string,
    width: number,
    index: number,
): Promise<Blob> {
    const api =
        createJellyfinApi(
            accessToken
        );

    const trickplayApi =
        getTrickPlayApi(api);

    const response =
        await trickplayApi
            .getTrickplayTileImage(
                {
                    itemId,
                    mediaSourceId,
                    width,
                    index,
                },
                {
                    responseType: 'blob',
                }
            );

    if (!(response.data instanceof Blob)) {
        throw new Error(
            'Jellyfin no devolvió el tile de Trickplay como Blob'
        );
    }

    return response.data;
}