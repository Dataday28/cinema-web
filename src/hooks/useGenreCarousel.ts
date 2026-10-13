import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaItem } from '../types/media';

import {
    getGenres,
    getMediaByGenre,
} from '../services/jellyfin/library';
import { selectGenres } from '../utils/genreSelection';

interface GenreCarousel {
    id: string;
    title: string;
    items: MediaItem[];

    totalCount: number;
    isLoadingMore: boolean;
    hasMore: boolean;
    nextIndex: number;
    loadError: boolean;
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
    const [pendingGenres, setPendingGenres] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const rowsRef = useRef<GenreCarousel[]>([]);
    const loadingRef = useRef(new Set<string>());
    const generationRef = useRef(0);

    useEffect(() => {
        rowsRef.current = rows;
    }, [rows]);

    useEffect(() => {
        setRows([]);
        setPendingGenres(0);
        setError(null);

        if (!enabled || !accessToken || !userId) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const credentials = { accessToken, userId };
        ++generationRef.current;
        loadingRef.current.clear();

        async function loadGenres() {
            setIsLoading(true);

            try {
                const genres = await getGenres(credentials);
                if (cancelled) return;

                const selectedGenres = selectGenres(genres, 8);

                setPendingGenres(selectedGenres.length);

                if (selectedGenres.length === 0) {
                    setIsLoading(false);
                    return;
                }

                let failedCount = 0;
                let completedCount = 0;

                await Promise.allSettled(
                    selectedGenres.map(async (genre, index) => {
                        try {
                            const result = await getMediaByGenre({
                                ...credentials,
                                genreId: genre.id,
                                limit: 20,
                            });

                            if (cancelled) return;

                            if (result.items.length >= 4) {
                                setRows((current) => {
                                    const updated = [
                                        ...current,
                                        {
                                            id: genre.id,
                                            title: genre.name,
                                            items: result.items,

                                            totalCount: result.totalCount,
                                            isLoadingMore: false,
                                            hasMore: result.items.length > 0 &&
                                                result.items.length < result.totalCount,
                                            nextIndex: result.items.length,
                                            loadError: false,
                                        },
                                    ];

                                    // Mantener el orden original de los géneros.
                                    const order = new Map(
                                        selectedGenres.map((g, i) => [g.id, i])
                                    );

                                    return updated.sort(
                                        (a, b) =>
                                            (order.get(a.id) ?? index) -
                                            (order.get(b.id) ?? index)
                                    );
                                });
                            }
                        } catch (err) {
                            failedCount++;
                            console.error(
                                `Error cargando género ${genre.name}:`,
                                err
                            );

                            if (!cancelled) {
                                setError(
                                    'Algunas categorías no pudieron cargarse.'
                                );
                            }
                        } finally {
                            completedCount++;

                            if (!cancelled) {
                                setPendingGenres(
                                    selectedGenres.length - completedCount
                                );
                            }
                        }
                    })
                );

                if (!cancelled && failedCount === 0) {
                    setError(null);
                }
            } catch (err) {
                if (cancelled) return;

                console.error('Error cargando géneros:', err);
                setError('No se pudieron cargar las categorías.');
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                    setPendingGenres(0);
                }
            }
        }

        void loadGenres();

        return () => {
            cancelled = true;
            generationRef.current++;
        };
    }, [accessToken, userId, enabled]);


    const loadMore = useCallback(async (genreId: string) => {
        if (!accessToken || !userId || !enabled) return;

        const row = rowsRef.current.find((item) => item.id === genreId);

        if (!row || !row.hasMore || loadingRef.current.has(genreId)) {
            return;
        }

        const generation = generationRef.current;
        const startIndex = row.nextIndex;

        loadingRef.current.add(genreId);

        setRows((current) =>
            current.map((item) =>
                item.id === genreId
                    ? {
                        ...item,
                        isLoadingMore: true,
                        loadError: false,
                    }
                    : item
            )
        );

        try {
            const result = await getMediaByGenre({
                accessToken,
                userId,
                genreId,
                startIndex,
                limit: 20,
            });

            if (generation !== generationRef.current) return;

            setRows((current) =>
                current.map((item) => {
                    if (item.id !== genreId) return item;

                    const unique = new Map(
                        item.items.map((media) => [media.id, media])
                    );

                    for (const media of result.items) {
                        unique.set(media.id, media);
                    }

                    const nextIndex = startIndex + result.items.length;

                    return {
                        ...item,
                        items: [...unique.values()],
                        totalCount: result.totalCount,
                        nextIndex,
                        hasMore:
                            result.items.length > 0 &&
                            nextIndex < result.totalCount,
                        isLoadingMore: false,
                        loadError: false,
                    };
                })
            );
        } catch (error) {
            if (generation !== generationRef.current) return;

            console.error('Error cargando más títulos:', error);

            setRows((current) =>
                current.map((item) =>
                    item.id === genreId
                        ? {
                            ...item,
                            isLoadingMore: false,
                            loadError: true,
                        }
                        : item
                )
            );
        } finally {
            if (generation === generationRef.current) {
                loadingRef.current.delete(genreId);
            }
        }
    }, [accessToken, userId, enabled]);

    return {
        rows,
        pendingGenres,
        isLoading,
        error,
        loadMore
    };
}