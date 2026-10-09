import { useEffect, useRef, useState } from 'react';
import type { MediaItem } from '../../types/media';
import { MediaCard } from './MediaCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaRowProps {
    title: string;
    items: MediaItem[];
    id?: string;
}

interface ScrollState {
    canScrollLeft: boolean;
    canScrollRight: boolean;
}

export function MediaRow({
    title,
    items,
    id,
}: MediaRowProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollState, setScrollState] = useState<ScrollState>({
        canScrollLeft: false,
        canScrollRight: false,
    });

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        const updateScrollState = () => {
            const maxScrollLeft = list.scrollWidth - list.clientWidth;

            setScrollState({
                canScrollLeft: list.scrollLeft > 0,
                canScrollRight: list.scrollLeft < maxScrollLeft - 1,
            });
        };

        updateScrollState();
        list.addEventListener('scroll', updateScrollState);

        const resizeObserver = new ResizeObserver(updateScrollState);
        resizeObserver.observe(list);

        return () => {
            list.removeEventListener('scroll', updateScrollState);
            resizeObserver.disconnect();
        };
    }, [items.length]);

    // Función de desplazamiento calculando el ancho exacto de bloques de cards
    const scroll = (direction: -1 | 1) => {
        const list = listRef.current;
        if (!list) return;

        // Obtenemos la primera card y su contenedor envolvente (snap container)
        const firstCardContainer = list.firstElementChild as HTMLElement | null;
        if (!firstCardContainer) return;

        // 1. Leemos el ancho dinámico actual de la tarjeta en pantalla + el gap (16px)
        const gap = 16;
        const cardWidth = firstCardContainer.getBoundingClientRect().width + gap;

        // 2. Calculamos cuántas tarjetas completas entran actualmente en la pantalla
        const visibleCards = Math.max(1, Math.floor(list.clientWidth / cardWidth));

        // 3. Desplazamos exactamente ese número de tarjetas
        const scrollAmount = visibleCards * cardWidth;

        list.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth',
        });
    };

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