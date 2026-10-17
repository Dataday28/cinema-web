import {
    useEffect,
    useRef,
    useState,
    
} from 'react';
import type {
    FocusEvent,
    KeyboardEvent,
} from 'react';
import type { MediaItem } from '../../types/media';
import { MediaPreview } from './MediaPreview';
import { useMediaDetails } from '../../context/MediaDetailsContext';

interface MediaCardProps {
    item: MediaItem;
}

export interface PreviewPosition {
    top: number;
    left: number;
    transformOrigin: string;
}

const PREVIEW_WIDTH = 360;
const SCREEN_MARGIN = 16;

export function MediaCard({ item }: MediaCardProps) {

    const { openMediaDetails } = useMediaDetails();
    const [showPreview, setShowPreview] = useState(false);
    const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);
    const cardRef = useRef<HTMLElement>(null);
    const openTimeout = useRef<number | null>(null);
    const closeTimeout = useRef<number | null>(null);
    const [previewTrigger, setPreviewTrigger] = useState<'mouse' | 'keyboard'>('mouse');
    const previewRef = useRef<HTMLDivElement>(null);
    const keyboardDismissed = useRef(false);
    const playButtonRef = useRef<HTMLButtonElement>(null);

    
    useEffect(() => {
        return () => {
            if (openTimeout.current) {
                window.clearTimeout(openTimeout.current);
            }

            if (closeTimeout.current) {
                window.clearTimeout(closeTimeout.current);
            }
        };
    }, []);
    
    
    const handlePreviewMouseEnter = () => {
        setPreviewTrigger('mouse');
        if (closeTimeout.current) {
            window.clearTimeout(closeTimeout.current);
        }
    };

    const handlePreviewMouseLeave = () => {
        closeTimeout.current = window.setTimeout(() => {
            setShowPreview(false);
        }, 150);
    };
    

    const handleMouseEnter = () => {
        if (window.innerWidth < 768) return;

        if (openTimeout.current !== null) {
            window.clearTimeout(openTimeout.current);
        }

        if (closeTimeout.current !== null) {
            window.clearTimeout(closeTimeout.current);
        }

        openTimeout.current = window.setTimeout(() => {
            if (document.activeElement === cardRef.current) {
                return;
            }

            updatePreviewPosition();
            setPreviewTrigger('mouse');
            setShowPreview(true);
        }, 400);
    };
    
    const handleMouseLeave = () => {
        if (openTimeout.current) {
            window.clearTimeout(openTimeout.current);
        }

        closeTimeout.current = window.setTimeout(() => {
            setShowPreview(false);
        }, 200);
    };

    const handleCardFocus = () => {
        if (keyboardDismissed.current) return;

        if (openTimeout.current !== null) {
            window.clearTimeout(openTimeout.current);
        }

        if (closeTimeout.current !== null) {
            window.clearTimeout(closeTimeout.current);
        }

        updatePreviewPosition();
        setPreviewTrigger('keyboard');
        setShowPreview(true);
    };

    const handleCardBlur = (event: FocusEvent<HTMLElement>) => {
        const next = event.relatedTarget;

        if (
            next instanceof Node &&
            previewRef.current?.contains(next)
        ) {
            return;
        }

        if (closeTimeout.current !== null) {
            window.clearTimeout(closeTimeout.current);
        }

        closeTimeout.current = window.setTimeout(() => {
            const active = document.activeElement;

            if (
                active !== cardRef.current &&
                !previewRef.current?.contains(active)
            ) {
                setShowPreview(false);
            }
        }, 0);
    };

    const handleCardKeyDown = (
        event: KeyboardEvent<HTMLElement>
    ) => {
        // Solo procesar teclas cuando el foco
        // está directamente sobre la tarjeta.
        if (event.target !== event.currentTarget) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();

            keyboardDismissed.current = true;
            setShowPreview(false);
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();

            openMediaDetails(item);
            setShowPreview(false);
            return;
        }

        if (
            event.key === 'Tab' &&
            !event.shiftKey &&
            showPreview
        ) {
            const playButton = playButtonRef.current;

            if (playButton) {
                event.preventDefault();
                playButton.focus();
            }
        }
    };

    const handleCardBlurCapture = () => {
        keyboardDismissed.current = false;
    };

    const updatePreviewPosition = () => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();

        const naturalCenterLeft = rect.left + rect.width / 2;
        const halfPreview = PREVIEW_WIDTH / 2;

        const minLeft = halfPreview + SCREEN_MARGIN;
        const maxLeft = Math.max(
            minLeft,
            window.innerWidth - halfPreview - SCREEN_MARGIN
        );

        const left = Math.max(
            minLeft,
            Math.min(naturalCenterLeft, maxLeft)
        );

        let transformOrigin = 'origin-center';

        if (naturalCenterLeft < minLeft) {
            transformOrigin = 'origin-left';
        } else if (naturalCenterLeft > maxLeft) {
            transformOrigin = 'origin-right';
        }

        setPreviewPosition({
            top: rect.top + rect.height / 2 + window.scrollY,
            left: left + window.scrollX,
            transformOrigin,
        });
    };

    return (
        <article
            ref={cardRef}
            tabIndex={0}
            role="button"
            aria-label={`Ver detalles de ${item.title}`}
            aria-haspopup="true"
            aria-expanded={showPreview}
            onFocus={handleCardFocus}
            onBlur={handleCardBlur}
            onBlurCapture={handleCardBlurCapture}
            onKeyDown={handleCardKeyDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
                relative
                w-[75vw]
                sm:w-70
                md:w-[320px]
                lg:w-69
                shrink-0
                cursor-pointer
                duration-200
                focus-visible:outline
                focus-visible:outline-offset-4
                focus-visible:outline-white
                ${showPreview ? 'opacity-0' : 'opacity-100'}
            `}
        >

            <div
                className="
                    relative
                    aspect-video
                    overflow-hidden
                    rounded-2xl
                    bg-[#181818]
                    "
            >
                <img
                    src={item.landscape}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"

                    className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-200
                        hover:scale-105
                    "
                />

                {item.progress !== undefined &&
                    item.progress > 0 && (

                        <div
                            className="
                                absolute
                                bottom-0
                                left-0
                                right-0
                                h-1.5
                                overflow-hidden
                                rounded-full
                                bg-white/30
                                "
                        >
                            <div
                                className="h-full bg-white"
                                style={{
                                    width: `${item.progress}%`,
                                }}
                            />
                        </div>

                    )}

            </div>

            {/* <h3 className="mt-2 text-sm font-medium text-white">
                {item.title}
            </h3> */}

            {showPreview && previewPosition && (
                <MediaPreview
                    key={item.id}
                    item={item}
                    position={previewPosition}
                    trigger={previewTrigger}
                    previewRef={previewRef}
                    playButtonRef={playButtonRef}
                    onClose={() => {
                        keyboardDismissed.current = true;
                        setShowPreview(false);
                        cardRef.current?.focus();
                    }}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}

        </article>
    );
}