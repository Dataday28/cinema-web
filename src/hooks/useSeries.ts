import {
    useEffect,
    useState,
} from 'react';

import type {
    Episode,
    Season,
} from '../types/media';

import {
    getSeasons,
    getEpisodes,
} from '../services/jellyfin/series';

import {
    useAuth,
} from '../context/AuthContext';

export function useSeries(
    seriesId: string
) {

    const { session } = useAuth();
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [ selectedSeasonId, setSelectedSeasonId ] = useState<string | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [isLoadingSeasons,setIsLoadingSeasons] = useState(false);
    const [isLoadingEpisodes,setIsLoadingEpisodes] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar temporadas
    useEffect(() => {

        if (!session || !seriesId) {
            return;
        }

        const loadSeasons = async () => {

            setIsLoadingSeasons(true);
            setError(null);

            try {

                const result =
                    await getSeasons(
                        seriesId,
                        {
                            accessToken:
                                session.accessToken,

                            userId:
                                session.userId,
                        }
                    );

                setSeasons(result);

                setSelectedSeasonId(
                    result[0]?.id ?? null
                );

            } catch (error) {

                console.error(
                    'Error cargando temporadas:',
                    error
                );

                setError(
                    'No se pudieron cargar las temporadas.'
                );

            } finally {

                setIsLoadingSeasons(false);

            }

        };

        loadSeasons();

    }, [seriesId, session]);

    // Cargar episodios cuando cambia temporada
    useEffect(() => {

        if (
            !session ||
            !seriesId ||
            !selectedSeasonId
        ) {
            return;
        }

        const loadEpisodes = async () => {

            setIsLoadingEpisodes(true);
            setError(null);

            try {

                const result =
                    await getEpisodes(
                        seriesId,
                        selectedSeasonId,
                        {
                            accessToken:
                                session.accessToken,

                            userId:
                                session.userId,
                        }
                    );

                setEpisodes(result);

            } catch (error) {

                console.error(
                    'Error cargando episodios:',
                    error
                );

                setError(
                    'No se pudieron cargar los episodios.'
                );

            } finally {

                setIsLoadingEpisodes(false);

            }

        };

        loadEpisodes();

    }, [
        seriesId,
        selectedSeasonId,
        session,
    ]);

    return {
        seasons,

        selectedSeasonId,
        setSelectedSeasonId,

        episodes,

        isLoadingSeasons,
        isLoadingEpisodes,

        error,
    };
}