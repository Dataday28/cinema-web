import { HeroCarousel } from '../../components/hero/HeroCarousel';
import { MediaRow } from '../../components/media/MediaRow';
import { GenreRowSkeleton } from '../../components/skeletons/GenreRowSkeleton';
import { HomeSkeleton } from '../../components/skeletons/HomeSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useFeaturedItems } from '../../hooks/useFeaturedItems';
import { useGenreCarousels } from '../../hooks/useGenreCarousel';
import { useHome } from '../../hooks/useHome';

export function Home() {
    const { session } = useAuth();

    const {
        movies,
        series,
        continueWatching,
        recentlyAdded,
        isLoading,
        error,
        hasPartialError,
        retry,
    } = useHome();

    const {
        rows: genreRows,
        pendingGenres,
        isLoading: genresLoading,
        error: genresError,
        loadMore
    } = useGenreCarousels({
        accessToken: session?.accessToken,
        userId: session?.userId,
    });

    const featuredItems = useFeaturedItems(
        movies,
        series,
        8
    );

    if (isLoading) {
        return <HomeSkeleton />;
    }

    if (error) {
        return (
            <main
                className="
                flex
                min-h-screen
                flex-col
                items-center
                justify-center
                gap-5
                bg-[#080a0d]
                px-6
                text-center
                text-white
            "
            >
                <h2 className="text-2xl font-semibold">
                    No pudimos cargar tu biblioteca
                </h2>

                <p className="max-w-md text-white/60">
                    Comprueba la conexión con Jellyfin e inténtalo de nuevo.
                </p>

                <button
                    type="button"
                    onClick={retry}
                    className="
                    cursor-pointer
                    rounded-md
                    bg-white
                    px-6
                    py-3
                    font-semibold
                    text-black
                    transition-colors
                    hover:bg-white/80
                "
                >
                    Reintentar
                </button>
            </main>
        );
    }


    return (
        <main id="inicio" className="bg-[#080a0d]">

            <HeroCarousel items={featuredItems} />

            <div
                className="
                    relative
                    z-10
                    -mt-6
                    space-y-8
                    px-3
                    pb-16
                    "
            >

                {hasPartialError && (
                    <div
                        role="status"
                        className="
                            mx-4
                            rounded-md
                            bg-white/6
                            px-5
                            py-4
                            text-sm
                            text-white/70
                            sm:mx-8
                            md:mx-12
                            lg:mx-16
                        "
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span>
                                Algunas secciones no pudieron cargarse.
                            </span>

                            <button
                                type="button"
                                onClick={retry}
                                className="
                                cursor-pointer
                                font-semibold
                                text-white
                                hover:underline
                            "
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}

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

                {movies.length > 0 && (
                    <MediaRow
                        id="peliculas"
                        title="Películas"
                        items={movies}
                    />
                )}

                {series.length > 0 && (
                    <MediaRow
                        id="series"
                        title="Series"
                        items={series}
                    />
                )}

                <section className="space-y-8" aria-label="Explorar por género">
                    {genreRows.map((row) => (
                        <MediaRow
                            key={row.id}
                            id={`genre-${row.id}`}
                            title={row.title}
                            items={row.items}
                            hasMore={row.hasMore}
                            isLoadingMore={row.isLoadingMore}
                            loadError={row.loadError}
                            onLoadMore={() => loadMore(row.id)}
                        />
                    ))}

                    {genresLoading && (
                        <div className="space-y-8">
                            {Array.from(
                                { length: Math.min(pendingGenres || 2, 4) },
                                (_, index) => (
                                    <GenreRowSkeleton key={index} />
                                )
                            )}
                        </div>
                    )}

                    {genresError && (
                        <p role="status" className="px-[4%] text-sm text-yellow-400/80">
                            {genresError}
                        </p>
                    )}
                </section>

            </div>

        </main>
    );
}