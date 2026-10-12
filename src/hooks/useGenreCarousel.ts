import { useEffect, useState } from 'react';
import type { MediaItem } from '../types/media';

import {
    getGenres,
    getMediaByGenre,
} from '../services/jellyfin/library';

interface GenreCarousel {
    id: string;
    title: string;
    items: MediaItem[];
}

interface UseGenreCarouselsParams {
    accessToken?: string;
    userId?: string;
    enabled?: boolean;
}

export function useGenreCarousels({
    accessToken,
    userId,
    enabled = true,
}: UseGenreCarouselsParams) {
    const [rows, setRows] = useState<GenreCarousel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !accessToken || !userId) {
            setRows([]);
            setIsLoading(false);
            setError(null);
            return;
        }

        let cancelled = false;

        async function loadGenres() {
            setIsLoading(true);
            setError(null);
            setRows([]);

            try {
                const credentials = {
                    accessToken: accessToken!,
                    userId: userId!,
                };

                const genres = await getGenres(credentials);

                // Limitamos a seis categorías inicialmente.
                const selectedGenres = genres.slice(0, 8);

                const results = await Promise.allSettled(
                    selectedGenres.map(async (genre) => {
                        const result = await getMediaByGenre({
                            ...credentials,
                            genreId: genre.id,
                            limit: 20,
                        });

                        return {
                            id: genre.id,
                            title: genre.name,
                            items: result.items,
                        };
                    })
                );

                if (cancelled) return;

                const successfulRows = results
                    .filter(
                        (
                            result
                        ): result is PromiseFulfilledResult<GenreCarousel> =>
                            result.status === 'fulfilled'
                    )
                    .map((result) => result.value)
                    .filter((row) => row.items.length >= 4);

                setRows(successfulRows);

                if (results.some((result) => result.status === 'rejected')) {
                    setError('Algunas categorías no pudieron cargarse.');
                }
            } catch (err) {
                if (cancelled) return;

                console.error('Error cargando géneros:', err);
                setError('No se pudieron cargar las categorías.');
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadGenres();

        return () => {
            cancelled = true;
        };
    }, [accessToken, userId, enabled]);

    return {
        rows,
        isLoading,
        error,
    };
}