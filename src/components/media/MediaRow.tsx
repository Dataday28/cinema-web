import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaItem } from '../../types/media';
import { MediaCard } from './MediaCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaRowProps {
    title: string;
    items: MediaItem[];
    id?: string;

    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;

    loadError?: boolean;
}

interface ScrollState {
    canScrollLeft: boolean;
    canScrollRight: boolean;
}

export function MediaRow({
    title,
    items,
    id,
    hasMore = false,
    isLoadingMore = false,
    onLoadMore,
    loadError = false,
}: MediaRowProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollState, setScrollState] = useState<ScrollState>({
        canScrollLeft: false,
        canScrollRight: false,
    });
    const scrollFrameRef = useRef<number | null>(null);
    const loadRequestedRef = useRef(false);
    const previousLoadingRef = useRef(isLoadingMore);


    useEffect(() => {
        return () => {
            if (scrollFrameRef.current !== null) {
                cancelAnimationFrame(scrollFrameRef.current);
            }
        };
    }, []);


    useEffect(() => {
        if (
            previousLoadingRef.current &&
            !isLoadingMore &&
            !loadError
        ) {
            loadRequestedRef.current = false;
        }

        previousLoadingRef.current = isLoadingMore;
    }, [isLoadingMore, loadError]);

    // Función de desplazamiento calculando el ancho exacto de bloques de cards
    const scroll = (direction: -1 | 1) => {
        const list = listRef.current;

        if (!list) return;

        const firstCard =
            list.firstElementChild as HTMLElement | null;

        if (!firstCard) return;

        // const remaining =
        //     list.scrollWidth - list.clientWidth - list.scrollLeft;

        // if (
        //     remaining < list.clientWidth * 0.75 &&
        //     hasMore &&
        //     !isLoadingMore &&
        //     onLoadMore
        // ) {
        //     onLoadMore();
        // }

        const styles = window.getComputedStyle(list);

        const gap = parseFloat(styles.columnGap) || 0;

        const cardWidth =
            firstCard.getBoundingClientRect().width;

        const cardStep = cardWidth + gap;

        const visibleCards = Math.max(
            1,
            Math.floor(
                (list.clientWidth + gap) / cardStep
            )
        );

        list.scrollBy({
            left: direction * visibleCards * cardStep,
            behavior: 'smooth',
        });
    };

    const checkLoadMore = useCallback(() => {
        const list = listRef.current;
        if (!list) return;

        if (!hasMore || isLoadingMore || loadError || !onLoadMore) return;

        const remaining =
            list.scrollWidth - list.clientWidth - list.scrollLeft;

        const threshold = list.clientWidth * 0.75;

        if (remaining <= threshold && !loadRequestedRef.current) {
            loadRequestedRef.current = true;
            onLoadMore();
        }
    }, [hasMore, isLoadingMore, loadError, onLoadMore]);

    const handleLoadMoreScroll = useCallback(() => {
        if (scrollFrameRef.current !== null) return;

        scrollFrameRef.current = requestAnimationFrame(() => {
            scrollFrameRef.current = null;
            checkLoadMore();
        });
    }, [checkLoadMore]);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        const updateScrollState = () => {
            const maxScrollLeft =
                list.scrollWidth - list.clientWidth;

            const threshold = 2;

            setScrollState((current) => {
                const next = {
                    canScrollLeft: list.scrollLeft > threshold,
                    canScrollRight:
                        list.scrollLeft < maxScrollLeft - threshold,
                };

                if (
                    current.canScrollLeft === next.canScrollLeft &&
                    current.canScrollRight === next.canScrollRight
                ) {
                    return current;
                }

                return next;
            });
        };

        const handleScroll = () => {
            updateScrollState();
            handleLoadMoreScroll();
        };

        const resizeObserver = new ResizeObserver(() => {
            updateScrollState();
            handleLoadMoreScroll();
        });

        list.addEventListener('scroll', handleScroll, {
            passive: true,
        });

        resizeObserver.observe(list);
        updateScrollState();

        return () => {
            list.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
        };
    }, [items.length, handleLoadMoreScroll]);

    useEffect(() => {
        if (!isLoadingMore && !loadError && hasMore) {
            handleLoadMoreScroll();
        }
    }, [
        items.length,
        isLoadingMore,
        loadError,
        hasMore,
        handleLoadMoreScroll,
    ]);

    return (
        <section id={id} className="mb-6 md:mb-8">
            <h2 className="mb-2 md:mb-3 px-4 text-lg font-bold text-white sm:px-8 md:px-12 lg:px-16 md:text-xl">
                {title}
            </h2>

            <div className="group relative">
                {scrollState.canScrollLeft && (
                    <button
                        type="button"
                        aria-label={`Desplazar ${title} a la izquierda`}
                        onClick={() => scroll(-1)}
                        className="hidden md:flex absolute left-0 top-1/2 z-10 h-full w-10 lg:w-13 -translate-y-1/2 items-center justify-center rounded-r-md bg-black/50 text-white transition-colors focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
                    >
                        <ChevronLeft
                            size={40}
                            className="transition-transform duration-300 ease-in-out hover:scale-125"
                        />
                    </button>
                )}

                <div
                    ref={listRef}
                    className="
                        flex
                        w-full
                        gap-3
                        overflow-x-auto
                        scroll-smooth
                        px-4 sm:px-8 md:px-12 lg:px-16
                        scroll-px-4 sm:scroll-px-8 md:scroll-px-12 lg:scroll-px-16
                        snap-x
                        snap-mandatory
                        scrollbar-none
                        [&::-webkit-scrollbar]:hidden
                    "
                >
                    {items.map((item) => (
                        <div key={item.id} className="snap-start shrink-0">
                            <MediaCard item={item} />
                        </div>
                    ))}

                    {isLoadingMore && (
                        <div
                            className="
                            flex
                            w-32
                            shrink-0
                            items-center
                            justify-center
                        "
                            role="status"
                            aria-label="Cargando más títulos"
                        >
                            <div
                                className="
                                h-7 w-7
                                animate-spin
                                rounded-full
                                border-2
                                border-white/20
                                border-t-white
                            "
                            />
                        </div>
                    )}

                    {loadError && !isLoadingMore && (
                        <div className="flex w-40 shrink-0 items-center justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    loadRequestedRef.current = false;
                                    onLoadMore?.();
                                }}
                                className="
                                cursor-pointer
                                rounded-3xl
                                border
                                border-white/20
                                bg-white/10
                                px-4
                                py-3
                                text-sm
                                text-white
                                hover:bg-white/20
                            "
                            >
                                Reintentar carga
                            </button>
                        </div>
                    )}
                    
                </div>

                {scrollState.canScrollRight && (
                    <button
                        type="button"
                        aria-label={`Desplazar ${title} a la derecha`}
                        onClick={() => scroll(1)}
                        className="hidden md:flex absolute right-0 top-1/2 z-10 h-full w-10 lg:w-12 -translate-y-1/2 items-center justify-center rounded-l-md bg-black/50 text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
                    >
                        <ChevronRight
                            size={40}
                            className="transition-transform duration-300 ease-in-out cursor-pointer hover:scale-125"
                        />
                    </button>
                )}
            </div>
        </section>
    );
}