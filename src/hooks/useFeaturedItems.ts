import { useMemo } from 'react';
import type { MediaItem } from '../types/media';

function shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [
            result[j],
            result[i],
        ];
    }

    return result;
}

export function useFeaturedItems(
    movies: MediaItem[],
    series: MediaItem[],
    maxItems = 8
): MediaItem[] {
    return useMemo(() => {
        const unique = new Map<string, MediaItem>();

        for (const item of [...movies, ...series]) {
            unique.set(item.id, item);
        }

        return shuffle([...unique.values()])
            .slice(0, maxItems);
    }, [movies, series, maxItems]);
}