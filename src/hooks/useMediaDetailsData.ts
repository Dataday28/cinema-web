import {
    useEffect,
    useState,
} from 'react';

import type {
    MediaDetailsData,
} from '../types/media';

import {
    useAuth,
} from '../context/AuthContext';

import {
    getMediaDetails,
} from '../services/jellyfin/details';

export function useMediaDetailsData(
    itemId?: string
) {

    const { session } =
        useAuth();

    const [details, setDetails] =
        useState<MediaDetailsData | null>(
            null
        );

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {

        if (!session || !itemId) {
            setDetails(null);
            return;
        }

        let cancelled = false;

        const load = async () => {

            setIsLoading(true);
            setError(null);

            // Evita mostrar durante un instante
            // los detalles del item anterior.
            setDetails(null);

            try {

                const result =
                    await getMediaDetails(
                        itemId,
                        {
                            accessToken:
                                session.accessToken,

                            userId:
                                session.userId,
                        }
                    );

                if (!cancelled) {
                    setDetails(result);
                }

            } catch (error) {

                console.error(
                    'Error cargando detalles:',
                    error
                );

                if (!cancelled) {
                    setError(
                        'No se pudieron cargar los detalles.'
                    );
                }

            } finally {

                if (!cancelled) {
                    setIsLoading(false);
                }

            }

        };

        load();

        return () => {
            cancelled = true;
        };

    }, [itemId, session]);

    return {
        details,
        isLoading,
        error,
    };
}