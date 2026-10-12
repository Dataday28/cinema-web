import { useCallback, useEffect, useState } from 'react';

import type { MediaItem } from '../types/media';

import {
    getMovies,
    getSeries,
    getContinueWatching,
    getRecentlyAdded,
} from '../services/jellyfin/library';

import { useAuth } from '../context/AuthContext';

interface HomeData {
    movies: MediaItem[];
    series: MediaItem[];
    continueWatching: MediaItem[];
    recentlyAdded: MediaItem[];
}

const initialData: HomeData = {
    movies: [],
    series: [],
    continueWatching: [],
    recentlyAdded: [],
};

export function useHome() {
    const { session } = useAuth();

    const [data, setData] = useState<HomeData>(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasPartialError, setHasPartialError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const accessToken = session?.accessToken;
    const userId = session?.userId;

    const retry = useCallback(() => {
        setRetryCount((current) => current + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        if (!accessToken || !userId) {
            setData(initialData);
            setIsLoading(false);
            setError(null);
            setHasPartialError(false);
            return;
        }

        const load = async () => {
            setIsLoading(true);
            setError(null);
            setHasPartialError(false);
            setData(initialData);

            const request = {
                accessToken,
                userId,
            };

            const results = await Promise.allSettled([
                getMovies(request),
                getSeries(request),
                getContinueWatching(request),
                getRecentlyAdded(request),
            ]);

            if (cancelled) return;

            const [
                moviesResult,
                seriesResult,
                continueResult,
                recentResult,
            ] = results;

            const failures = results.filter(
                (result) => result.status === 'rejected'
            );

            failures.forEach((failure) => {
                if (failure.status === 'rejected') {
                    console.error(
                        'Error cargando sección de Home:',
                        failure.reason
                    );
                }
            });

            if (failures.length === results.length) {
                setError(
                    'No se pudo cargar la biblioteca. Inténtalo nuevamente.'
                );
                setIsLoading(false);
                return;
            }

            setData({
                movies:
                    moviesResult.status === 'fulfilled'
                        ? moviesResult.value
                        : [],

                series:
                    seriesResult.status === 'fulfilled'
                        ? seriesResult.value
                        : [],

                continueWatching:
                    continueResult.status === 'fulfilled'
                        ? continueResult.value
                        : [],

                recentlyAdded:
                    recentResult.status === 'fulfilled'
                        ? recentResult.value
                        : [],
            });

            setHasPartialError(failures.length > 0);
            setIsLoading(false);
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [accessToken, userId, retryCount]);

    return {
        ...data,
        isLoading,
        error,
        hasPartialError,
        retry,
    };
}