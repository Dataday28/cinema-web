import type { MediaDetailsData } from '../../types/media';
import PlayIcon from '../../assets/play.svg';
import PlusIcon from '../../assets/plus.png';
import HeartIcon from '../../assets/heart.png';
import { usePlayback } from '../../context/PlaybackContext';

interface MediaDetailsHeroProps {
    item: MediaDetailsData;
}

function Badge({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <span className="rounded border border-gray-500 px-1.5">
            {children}
        </span>
    );
}

function formatRuntime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return `${hours}h ${remaining}m`;
}

export function MediaDetailsHero({
    item,
}: MediaDetailsHeroProps) {
    const { play } = usePlayback();

    return (
        <>
            <div
                className="
                    relative
                    aspect-16/7
                    bg-cover
                    bg-center
                    "
                style={{
                    backgroundImage: `url("${item.backdrop ?? item.image
                        }")`,
                }}
            >
                <div
                    className="
                        absolute inset-0
                        bg-linear-to-t
                        from-[#181818]
                        via-transparent
                        to-black/20
                    "
                />

                <div
                    className="
                        absolute
                        bottom-8 left-8
                        max-w-lg
                    "
                >
                    {item.logo ? (
                        <img
                            src={item.logo}
                            alt={item.title}
                            className="
                                mb-6
                                max-h-32
                                max-w-sm
                                object-contain
                                object-left
                            "
                        />
                    ) : (
                        <h1 className="mb-6 text-4xl font-bold">
                            {item.title}
                        </h1>
                    )}

                    <div className="flex gap-3 flrx-wrap items-center">
                        <button
                            onClick={() => play(item.id)}
                            className="
                                rounded-md
                                bg-white
                                px-6 py-3
                                font-semibold
                                text-black
                                transition
                                hover:bg-gray-200
                                cursor-pointer
                            "
                        >
                            <img src={PlayIcon} alt="Reproducir" className="mr-2 inline h-4.5 w-4.5" />
                            Reproducir
                        </button>

                        <button
                            className="
                                flex h-9 w-9
                                items-center justify-center
                                rounded-full
                                border border-gray-400
                                text-2xl
                                transition
                                hover:border-white
                                cursor-pointer
                            "
                        >
                            <img src={PlusIcon} alt="Añadir a la lista" className="h-4.5 w-4.5" />
                        </button>

                        <button
                            className="
                                flex h-9 w-9
                                items-center justify-center
                                rounded-full
                                border border-gray-400
                                text-2xl
                                transition
                                hover:border-white
                                cursor-pointer
                            "
                        >
                            <img src={HeartIcon} alt="Añadir a la lista" className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 px-8 pb-8 md:grid-cols-[2fr_1fr]">

                <div>
                    <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-300">

                        {item.year && (
                            <span>{item.year}</span>
                        )}

                        {item.runtime && (
                            <span>{formatRuntime(item.runtime)}</span>
                        )}

                        {item.quality?.resolution && (
                            <Badge>
                                {item.quality.resolution}
                            </Badge>
                        )}

                        {item.quality?.hdr && (
                            <Badge>
                                {item.quality.hdr}
                            </Badge>
                        )}

                    </div>

                    <p className="leading-relaxed text-gray-200">
                        {item.description}
                    </p>
                </div>

                <div className="space-y-2 text-sm">

                {item?.cast &&
                    item.cast.length > 0 && (
                        <p>
                            <span className="text-gray-500">
                                Elenco:{' '}
                            </span>

                            {item.cast
                                .filter(
                                    (person) =>
                                        person.type === 'Actor'
                                )
                                .slice(0, 5)
                                .map(
                                    (person) => person.name
                                )
                                .join(', ')}
                        </p>
                    )}

                    {item.genres && (
                        <p>
                            <span className="text-gray-500">
                                Géneros:{' '}
                            </span>

                            {item.genres.join(', ')}
                        </p>
                    )}

                    {item.director && (
                        <p>
                            <span className="text-gray-500">
                                Director:{' '}
                            </span>

                            {item.director}
                        </p>
                    )}

                    {item.officialRating && (
                        <span
                            className="
                                border
                                border-white/30
                                px-1.5
                                text-xs
                                "
                        >
                            {item.officialRating}
                        </span>
                    )}

                    {item.tagline && (
                        <p
                            className="
                            mb-3
                            text-lg
                            italic
                            text-gray-300
                            "
                        >
                            {item.tagline}
                        </p>
                    )}

                </div>
            </div>
        </>
    );
}