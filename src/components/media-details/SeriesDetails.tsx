import type {
    MediaItem,
} from '../../types/media';

import {
    useSeries,
} from '../../hooks/useSeries';

import {
    SeasonSelector,
} from './SeasonSelector';

import {
    EpisodeList,
} from './EpisodeList';

interface SeriesDetailsProps {
    series: MediaItem;
}

export function SeriesDetails({
    series,
}: SeriesDetailsProps) {

    const {
        seasons,
        selectedSeasonId,
        setSelectedSeasonId,
        episodes,
        isLoadingSeasons,
        isLoadingEpisodes,
        error,
    } = useSeries(series.id);

    if (isLoadingSeasons) {
        return (
            <section className="px-8 pb-10">
                <p className="text-gray-400">
                    Cargando temporadas...
                </p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="px-8 pb-10">
                <p className="text-red-400">
                    {error}
                </p>
            </section>
        );
    }

    return (
        <section className="px-8 pb-10">

            <div
                className="
                    mb-6
                    flex
                    items-center
                    justify-between
                    "
            >
                <h2 className="text-2xl font-semibold">
                    Episodios
                </h2>

                {seasons.length > 0 && (
                    <SeasonSelector
                        seasons={seasons}
                        selectedSeasonId={
                            selectedSeasonId
                        }
                        onChange={
                            setSelectedSeasonId
                        }
                    />
                )}

            </div>

            {isLoadingEpisodes ? (

                <p className="text-gray-400">
                    Cargando episodios...
                </p>

            ) : (

                <EpisodeList
                    episodes={episodes}
                />

            )}

        </section>
    );
}