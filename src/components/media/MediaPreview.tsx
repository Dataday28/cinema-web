import { createPortal } from 'react-dom';
import type { MediaItem } from '../../types/media';
import { useMediaDetails } from '../../context/MediaDetailsContext';
import { usePlayback } from '../../context/PlaybackContext';
import type { PreviewPosition } from './MediaCard';
import { useEffect, useState } from 'react';
import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";

interface MediaPreviewProps {
    item: MediaItem;

    position: PreviewPosition

    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

function formatRuntime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}

export function MediaPreview({
    item,
    position,
    onMouseEnter,
    onMouseLeave,
}: MediaPreviewProps) {

    const { openMediaDetails } = useMediaDetails();
    const { play } = usePlayback();
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // En el siguiente frame del navegador, activamos la expansión
        const animationFrame = requestAnimationFrame(() => {
            setIsExpanded(true);
        });
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return createPortal(
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`
                absolute
                z-50
                w-78
                -translate-x-1/2
                -translate-y-30
                ${position.transformOrigin}
                overflow-hidden
                rounded-2xl
                bg-[#181818]
                shadow-2xl
                shadow-black/95
                transition-all
                duration-300
                cubic-bezier(0.2, 0, 0, 1)
                ${
                isExpanded
                    ? 'scale-125 -translate-y-6 shadow-black/95'
                    : 'scale-100 translate-y-0 opacity-90'
                }
            `}

            style={{
                top: position.top,
                left: position.left,

            }}
        >
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    src={item.landscape ?? item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                />

                {item.progress !== undefined && item.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden rounded-full bg-white/30">
                        <div
                            className="h-full bg-white"
                            style={{ width: `${item.progress}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="mb-4 flex items-center gap-2">

                    <button
                        onClick={() => play(item.id)}
                        className="
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            bg-white text-black
                            transition
                            hover:bg-gray-200
                            cursor-pointer
                            "
                    >
                        <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                    </button>

                    <button
                        className="
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            border border-gray-500
                            text-xl text-white
                            transition
                            hover:border-white
                            cursor-pointer
                            "
                    >
                        <Plus className="w-4 h-4" />
                    </button>

                    <button
                        className="
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            border border-gray-500
                            text-white
                            transition
                            hover:border-white
                            cursor-pointer
                            "
                    >
                        <ThumbsUp className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => openMediaDetails(item)}
                        className="
                            ml-auto
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            border border-gray-500
                            text-white
                            transition
                            hover:border-white
                            cursor-pointer
                            "
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>

                </div>

                {/* <h3 className="mb-2 text-lg font-semibold text-white">
                    {item.title}
                </h3> */}

                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">

                    {item.type && (
                        <span>{item.type === 'movie' ? 'Pelicula' : 'Serie'}</span>
                    )}

                    {item.year && (
                        <span>{item.year}</span>
                    )}

                    {item.runtime && (
                        <span>
                            {formatRuntime(item.runtime)}
                        </span>
                    )}

                    {item.quality?.resolution && (
                        <span className="rounded border border-gray-500 px-1.5 py-0.5 text-xs">
                            {item.quality.resolution}
                        </span>
                    )}

                    {item.quality?.hdr && (
                        <span className="rounded border border-gray-500 px-1.5 py-0.5 text-xs">
                            {item.quality.hdr}
                        </span>
                    )}
                    

                </div>

                {item.genres && item.genres.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-300">
                        {item.genres.map((genre, index) => (
                            <span
                                key={genre}
                                className="flex items-center gap-2"
                            >
                                {genre}

                                {index < item.genres!.length - 1 && (
                                    <span className="text-gray-600">
                                        •
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>,

        document.body
    );
}