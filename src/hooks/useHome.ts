import {
    useEffect,
    useState,
} from 'react';

import type {
    MediaItem,
} from '../types/media';

import {
    getMovies,
    getSeries,
    getContinueWatching,
    getRecentlyAdded,
} from '../services/jellyfin/library';

import {
    useAuth,
} from '../context/AuthContext';

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

    useEffect(() => {

        if (!session) {
            return;
        }

        const load = async () => {

            setIsLoading(true);
            setError(null);

            try {

                const request = {
                    accessToken:
                        session.accessToken,

                    userId:
                        session.userId,
                };

                const [
                    movies,
                    series,
                    continueWatching,
                    recentlyAdded,
                ] = await Promise.all([
                    getMovies(request),
                    getSeries(request),
                    getContinueWatching(request),
                    getRecentlyAdded(request),
                ]);

                setData({
                    movies,
                    series,
                    continueWatching,
                    recentlyAdded,
                });

            } catch (error) {

                console.error(
                    'Error cargando Home:',
                    error
                );

                setError(
                    'No se pudo cargar la biblioteca.'
                );

            } finally {

                setIsLoading(false);

            }

        };

        load();

    }, [session]);

    return {
        ...data,
        isLoading,
        error,
    };
}