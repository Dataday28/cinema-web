import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { MediaItem } from '../../types/media';
import { Hero } from './Hero';

interface HeroCarouselProps {
    items: MediaItem[];
    interval?: number;
}

export function HeroCarousel({
    items,
    interval = 8000,
}: HeroCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const total = items.length;

    useEffect(() => {
        setActiveIndex(0);
    }, [items]);

    useEffect(() => {
        if (isPaused || total <= 1) return;

        const timer = window.setInterval(() => {
            setActiveIndex((current) =>
                (current + 1) % total
            );
        }, interval);

        return () => window.clearInterval(timer);
    }, [isPaused, total, interval]);

    const goTo = (index: number) => {
        setActiveIndex(
            (index + total) % total
        );
    };

    if (total === 0) return null;

    return (
        <section
            aria-label="Contenido destacado"
            className="group relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
                if (
                    !event.currentTarget.contains(
                        event.relatedTarget as Node | null
                    )
                ) {
                    setIsPaused(false);
                }
            }}
        >
            <Hero item={items[activeIndex]} />

            {total > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => goTo(activeIndex - 1)}
                        aria-label="Destacado anterior"
                        className="
                            absolute
                            left-4
                            top-1/2
                            z-20
                            -translate-y-1/2
                            rounded-full
                            bg-black/40
                            p-3
                            text-white
                            opacity-0
                            transition-opacity
                            hover:bg-black/70
                            focus-visible:opacity-100
                            group-hover:opacity-100
                            max-md:opacity-100
                        "
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        type="button"
                        onClick={() => goTo(activeIndex + 1)}
                        aria-label="Siguiente destacado"
                        className="
                            absolute
                            right-4
                            top-1/2
                            z-20
                            -translate-y-1/2
                            rounded-full
                            bg-black/40
                            p-3
                            text-white
                            opacity-0
                            transition-opacity
                            hover:bg-black/70
                            focus-visible:opacity-100
                            group-hover:opacity-100
                            max-md:opacity-100
                        "
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div
                        className="
                            absolute
                            bottom-12
                            right-4
                            z-20
                            flex
                            gap-2
                            sm:right-8
                            md:right-12
                            lg:right-16
                        "
                        aria-label="Seleccionar contenido destacado"
                    >
                        {items.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => goTo(index)}
                                aria-label={`Mostrar destacado ${index + 1}: ${item.title}`}
                                aria-current={
                                    index === activeIndex
                                        ? 'true'
                                        : undefined
                                }
                                className={`
                                    h-1.5
                                    cursor-pointer
                                    rounded-full
                                    transition-all
                                    duration-300
                                    ${index === activeIndex
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/40 hover:bg-white/70'
                                    }
                                `}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}