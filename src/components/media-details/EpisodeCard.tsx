import type { Episode } from '../../types/media';
import PlayWhiteIcon from '../../assets/play-red.png';
import CheckIcon from '../../assets/check.png';
import { usePlayback } from '../../context/PlaybackContext';

interface EpisodeCardProps {
    episode: Episode;
}

export function EpisodeCard({
    episode,
}: EpisodeCardProps) {
    const { play } = usePlayback();

    return (
        <article
            onClick={() => play(episode.id)}
            className="
                group
                grid
                cursor-pointer
                grid-cols-[40px_180px_1fr]
                items-center
                gap-4
                rounded-md
                p-4
                transition
                hover:bg-white/5
            "
        >
            <div
                className="
                    flex
                    items-center
                    justify-center
                    text-xl
                    text-gray-400
                "
            >
                {episode.watched
                    ? <img src={CheckIcon} alt="Visto" className="h-6 w-6" />
                    : episode.episodeNumber}
            </div>

            <div
                className="
                    relative
                    aspect-video
                    overflow-hidden
                    rounded-md
                    bg-[#242424]
                    "
            >
                {episode.image && (
                    <img
                        src={episode.image}
                        alt={episode.title}
                        className="
                            h-full
                            w-full
                            object-cover
                            "
                    />
                )}

                <div
                    className="
                        absolute inset-0
                        flex
                        items-center
                        justify-center
                        bg-black/0
                        transition
                        group-hover:bg-black/40
                    "
                >
                    <span
                        className="
                            flex h-10 w-10
                            scale-75
                            items-center
                            justify-center
                            rounded-full
                            bg-black/40
                            opacity-0
                            transition
                            group-hover:scale-100
                            group-hover:opacity-100
                            "
                    >
                        <img src={PlayWhiteIcon} alt="Reproducir" className="h-4.5 w-4.5" />
                    </span>
                </div>

                {episode.progress !== undefined &&
                    episode.progress > 0 &&
                    episode.progress < 100 && (
                        <div
                            className="
                                absolute
                                bottom-0 left-0 right-0
                                h-1
                                bg-white/30
                            "
                        >
                            <div
                                className="h-full bg-cyan-500"
                                style={{
                                    width: `${episode.progress}%`,
                                }}
                            />
                        </div>
                    )}
            </div>

            <div>
                <div
                    className="
                        mb-2
                        flex
                        items-center
                        justify-between
                        gap-4
                    "
                >
                    <h3 className="font-semibold">
                        {episode.title}
                    </h3>

                    {episode.runtime && (
                        <span className="shrink-0 text-sm text-gray-400">
                            {formatRuntime(episode.runtime)}
                        </span>
                    )}
                </div>

                {episode.description && (
                    <p
                        className="
                            line-clamp-2
                            text-sm
                            leading-relaxed
                            text-gray-400
                            "
                    >
                        {episode.description}
                    </p>
                )}
            </div>

        </article>
    );
}

function formatRuntime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    if (hours === 0) {
        return `${minutes} min`;
    }

    return `${hours}h ${remaining}m`;
}