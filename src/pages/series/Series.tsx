import { Hero } from '../../components/hero/Hero';
import { MediaRow } from '../../components/media/MediaRow';
import { useHome } from '../../hooks/useHome';

export function Series() {
    const {
        movies,
        series,
        continueWatching,
        recentlyAdded,
        isLoading,
        error,
    } = useHome();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#080a0d] text-white">
                Cargando...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#080a0d] text-white">
                {error}
            </div>
        );
    }

    const featured =
        recentlyAdded[0] ??
        movies[0] ??
        series[0];


    return (
        <main id="inicio" className="bg-[#1b1b1d] pt-12">

            {featured && (
                <Hero item={featured} />
            )}

            <div
                className="
                    relative
                    z-10
                    -mt-6
                    space-y-8
                    px-[4%]
                    pb-16
                    "
            >

                {recentlyAdded.length > 0 && (
                    <MediaRow
                        title="Agregadas recientemente"
                        items={recentlyAdded}
                    />
                )}

                {continueWatching.length > 0 && (
                    <MediaRow
                        title="Continuar viendo"
                        items={continueWatching}
                    />
                )}

                {series.length > 0 && (
                    <MediaRow
                        id="series"
                        title="Series"
                        items={series}
                    />
                )}

            </div>

        </main>
    );
}