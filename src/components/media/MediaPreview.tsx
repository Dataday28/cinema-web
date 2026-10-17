import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { MediaItem } from '../../types/media';
import { useMediaDetails } from '../../context/MediaDetailsContext';
import { usePlayback } from '../../context/PlaybackContext';
import type { PreviewPosition } from './MediaCard';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { getMediaTrailers, type TrailerInfo } from '../../services/jellyfin/traileres';
import { YouTubePreview } from './YouTubePreview';
import { Volume2, VolumeX } from 'lucide-react';
import { activatePreview, subscribeToPreview } from '../../utils/previewCoordinator';
import { sortTrailers } from '../../utils/trailerSelector';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';


type PreviewTrigger = 'mouse' | 'keyboard';

interface MediaPreviewProps {
    item: MediaItem;

    position: PreviewPosition

    onMouseEnter: () => void;
    onMouseLeave: () => void;

    trigger?: PreviewTrigger;

    previewRef?: RefObject<HTMLDivElement | null>;
    onClose?: () => void;
    playButtonRef?: React.RefObject<HTMLButtonElement | null>;
    onExitForward?: () => void;
    onDismiss?: () => void;
}

const previewButtonFocusClass = `
    focus:outline-none
    focus-visible:ring-[3px]
    focus-visible:ring-sky-400
    focus-visible:ring-offset-2
    focus-visible:ring-offset-[#181818]
    focus-visible:scale-110
    transition-transform duration-150
    motion-reduce:transition-none
`;

function formatRuntime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}

function supportsTrailerPreview(type: string): boolean {
    return ['movie', 'series', 'episode'].includes(
        type.toLowerCase()
    );
}

export function MediaPreview({
    item,
    position,
    onMouseEnter,
    onMouseLeave,
    trigger = 'mouse',
    previewRef,
    playButtonRef,
    onClose,
    onExitForward,
    onDismiss,
}: MediaPreviewProps) {

    const { openMediaDetails } = useMediaDetails();
    const { play } = usePlayback();
    const [isExpanded, setIsExpanded] = useState(false);

    const { session } = useAuth();

    const [trailerId, setTrailerId] = useState<string | null>(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerPlaying, setTrailerPlaying] = useState(false);

    const [trailerMuted, setTrailerMuted] = useState(false);
    const [trailerFinished, setTrailerFinished] = useState(false);

    const previewInstanceId = useRef(
        crypto.randomUUID()
    );

    const [availableTrailers, setAvailableTrailers] =
        useState<TrailerInfo[]>([]);

    const [trailerIndex, setTrailerIndex] = useState(0);

    const { settings } = usePreviewSettings();
    
    useEffect(() => {
        return subscribeToPreview((activeId) => {
            if (activeId === previewInstanceId.current) {
                return;
            }

            setShowTrailer(false);
            setTrailerPlaying(false);
            setTrailerMuted(true);
            setTrailerFinished(true);
        });
    }, []);

    useEffect(() => {
        // En el siguiente frame del navegador, activamos la expansión
        const animationFrame = requestAnimationFrame(() => {
            setIsExpanded(true);
        });
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    useEffect(() => {
        if (
            !session ||
            !settings.autoplay ||
            trigger === 'keyboard' ||
            !supportsTrailerPreview(item.type) ||
            trailerFinished
        ) {
            return;
        }

        let cancelled = false;

        const timeout = window.setTimeout(async () => {
            try {
                const trailers = await getMediaTrailers({
                    itemId: item.id,
                    userId: session.userId,
                    accessToken: session.accessToken,
                });

                if (cancelled || trailers.length === 0) {
                    return;
                }

                const sortedTrailers = sortTrailers(
                    trailers,
                    settings.language
                );

                activatePreview(previewInstanceId.current);
                setAvailableTrailers(sortedTrailers);
                setTrailerIndex(0);
                setTrailerId(sortedTrailers[0].id);
                setShowTrailer(true);

            } catch (error) {
                console.warn('Error cargando tráiler:', error);
            }
        }, settings.delay);

        return () => {
            cancelled = true;
            window.clearTimeout(timeout);
        };
    }, [
        item.id,
        item.type,
        session,
        trailerFinished,
        settings.autoplay,
        settings.delay,
        settings.language
    ]);

    useEffect(() => {
        if (settings.autoplay) return;

        setShowTrailer(false);
        setTrailerPlaying(false);
        setTrailerMuted(true);
    }, [settings.autoplay]);

    const handleTrailerReady = useCallback(() => {
        setTrailerPlaying(true);
    }, []);

    const handleTrailerError = useCallback(() => {
        setTrailerPlaying(false);
        setTrailerMuted(true);

        const nextIndex = trailerIndex + 1;

        if (nextIndex < availableTrailers.length) {
            const nextTrailer = availableTrailers[nextIndex];

            console.info(
                'Intentando tráiler alternativo:',
                nextTrailer.name
            );

            setTrailerIndex(nextIndex);
            setTrailerId(nextTrailer.id);

            return;
        }

        // Se agotaron los tráileres disponibles
        setShowTrailer(false);
        setTrailerFinished(true);
    }, [trailerIndex, availableTrailers]);

    const handleTrailerEnded = useCallback(() => {
        setTrailerPlaying(false);
        setShowTrailer(false);
        setTrailerFinished(true);
        setTrailerMuted(true);
    }, []);

    const handleToggleTrailerSound = useCallback(() => {
        setTrailerMuted((previous) => !previous);
    }, []);

    const handlePreviewKeyDown = (
        event: KeyboardEvent<HTMLDivElement>
    ) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();

            onClose?.();
            return;
        }

        if (event.key !== 'Tab') {
            return;
        }

        const container = previewRef?.current;

        if (!container) {
            return;
        }

        const buttons = Array.from(
            container.querySelectorAll<HTMLButtonElement>(
                'button:not([disabled]):not([tabindex="-1"])'
            )
        );

        if (buttons.length === 0) {
            return;
        }

        const currentIndex = buttons.indexOf(
            document.activeElement as HTMLButtonElement
        );

        if (currentIndex === -1) {
            return;
        }

        // Shift + Tab desde el primer botón:
        // regresar a la tarjeta.
        if (event.shiftKey && currentIndex === 0) {
            event.preventDefault();
            event.stopPropagation();

            onClose?.();
            return;
        }

        // Tab desde el último botón:
        // salir del popup y continuar por la página.
        if (
            !event.shiftKey &&
            currentIndex === buttons.length - 1
        ) {
            event.preventDefault();
            event.stopPropagation();

            onExitForward?.();
            return;
        }

        const nextIndex = event.shiftKey
            ? currentIndex - 1
            : currentIndex + 1;

        const nextButton = buttons[nextIndex];

        if (nextButton) {
            event.preventDefault();
            event.stopPropagation();

            nextButton.focus();
        }
    };

    const handlePreviewBlur = (
        event: React.FocusEvent<HTMLDivElement>
    ) => {
        const nextElement = event.relatedTarget;

        if (
            nextElement instanceof Node &&
            event.currentTarget.contains(nextElement)
        ) {
            return;
        }

        if (nextElement === null) {
            return;
        }

        onMouseLeave();
    };


    return createPortal(
        <div
            ref={previewRef}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onBlur={handlePreviewBlur}
            onKeyDown={handlePreviewKeyDown}
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
                ${isExpanded
                    ? 'scale-125 -translate-y-6 shadow-black/95'
                    : 'scale-100 translate-y-0 opacity-90'
                }
            `}

            style={{
                top: position.top,
                left: position.left,

            }}
        >

            <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                    src={item.landscape ?? item.image}
                    alt={item.title}
                    className={`
                        absolute inset-0 z-10
                        h-full w-full object-cover
                        pointer-events-none
                        transition-opacity duration-700 ease-in-out
                        ${trailerPlaying ? 'opacity-0' : 'opacity-100'}
                    `}
                />

                {showTrailer && trailerId && !trailerFinished && (
                    <div className="absolute inset-0">
                        <YouTubePreview
                            key={trailerId}
                            videoId={trailerId}
                            muted={trailerMuted}
                            onReady={handleTrailerReady}
                            onEnded={handleTrailerEnded}
                            onError={handleTrailerError}
                        />
                    </div>
                )}

                {trailerPlaying && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleToggleTrailerSound();
                        }}
                        aria-label={
                            trailerMuted
                                ? 'Activar sonido'
                                : 'Silenciar tráiler'
                        }
                        className={`
                            absolute bottom-3 right-3 z-20
                            flex h-5 w-5 items-center justify-center
                            rounded-full border border-white/60
                            bg-black/50 text-white
                            backdrop-blur-sm transition-colors
                            hover:bg-black/80
                        `}
                    >
                        {trailerMuted
                            ? <VolumeX size={10} />
                            : <Volume2 size={10} />
                        }
                    </button>
                )}
            </div>

            <div className="p-4">
                <div className="mb-4 flex items-center gap-2">

                    <button
                        ref={playButtonRef}
                        type="button"
                        aria-label={`Reproducir ${item.title}`}
                        onClick={(event) => {
                            event.stopPropagation();

                            onDismiss?.();
                            play(item.id);
                        }}
                        className={`
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            bg-white text-black
                            transition
                            hover:bg-gray-200
                            cursor-pointer
                            ${previewButtonFocusClass}
                        `}
                    >
                        <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                    </button>

                    <button
                        aria-label='Agregar a mi lista'
                        className={`
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            border border-gray-500
                            text-xl text-white
                            transition
                            hover:border-white
                            cursor-pointer
                            ${previewButtonFocusClass}
                        `}
                    >
                        <Plus className="w-4 h-4" />
                    </button>

                    <button
                        aria-label='Me gusta'
                        className={`
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            border border-gray-500
                            text-white
                            transition
                            hover:border-white
                            cursor-pointer
                            ${previewButtonFocusClass}
                        `}
                    >
                        <ThumbsUp className="w-4 h-4" />
                    </button>

                    <button
                        aria-label='Ver detalles'
                        onClick={(event) => {
                            event.stopPropagation();

                            onDismiss?.();
                            openMediaDetails(item);
}}
                        className={`
                            ml-auto
                            flex h-10 w-10
                            items-center justify-center
                            rounded-full
                            border border-gray-500
                            text-white
                            transition
                            hover:border-white
                            cursor-pointer
                            ${previewButtonFocusClass}
                        `}
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