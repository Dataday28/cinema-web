import { useEffect, useRef, useState } from 'react';

interface HeroBackgroundProps {
    imageUrl: string | null;
    duration?: number;
}

export function HeroBackground({
    imageUrl,
    duration = 700,
}: HeroBackgroundProps) {
    const [visibleImage, setVisibleImage] = useState<string | null>(
        imageUrl || null
    );

    const [incomingImage, setIncomingImage] = useState<string | null>(null);
    const [isFading, setIsFading] = useState(false);

    const requestId = useRef(0);
    const transitionTimer = useRef<number | null>(null);
    const frameId = useRef<number | null>(null);

    // Guardamos las URLs también en refs para evitar
    // que las cargas dependan de renders intermedios.
    const visibleRef = useRef<string | null>(imageUrl || null);
    const incomingRef = useRef<string | null>(null);

    useEffect(() => {
        const nextUrl = imageUrl || null;
        const id = ++requestId.current;

        if (transitionTimer.current !== null) {
            window.clearTimeout(transitionTimer.current);
            transitionTimer.current = null;
        }

        if (frameId.current !== null) {
            window.cancelAnimationFrame(frameId.current);
            frameId.current = null;
        }

        if (!nextUrl) {
            visibleRef.current = null;
            incomingRef.current = null;
            setVisibleImage(null);
            setIncomingImage(null);
            setIsFading(false);
            return;
        }

        if (nextUrl === visibleRef.current) {
            incomingRef.current = null;
            setIncomingImage(null);
            setIsFading(false);
            return;
        }

        const image = new Image();

        image.onload = () => {
            if (id !== requestId.current) return;

            incomingRef.current = nextUrl;
            setIncomingImage(nextUrl);
            setIsFading(false);

            // Dos frames garantizan que el navegador
            // registre primero la opacidad inicial.
            frameId.current = requestAnimationFrame(() => {
                frameId.current = requestAnimationFrame(() => {
                    if (id !== requestId.current) return;

                    setIsFading(true);

                    transitionTimer.current = window.setTimeout(() => {
                        if (id !== requestId.current) return;

                        visibleRef.current = nextUrl;
                        incomingRef.current = null;

                        setVisibleImage(nextUrl);
                        setIncomingImage(null);
                        setIsFading(false);
                    }, duration);
                });
            });
        };

        image.onerror = () => {
            if (id !== requestId.current) return;

            console.warn('No se pudo cargar el fondo del Hero.');
        };

        image.src = nextUrl;

        return () => {
            requestId.current++;

            if (transitionTimer.current !== null) {
                window.clearTimeout(transitionTimer.current);
                transitionTimer.current = null;
            }

            if (frameId.current !== null) {
                window.cancelAnimationFrame(frameId.current);
                frameId.current = null;
            }
        };
    }, [imageUrl, duration]);

    return (
        <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
        >
            {visibleImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url("${visibleImage}")`,
                    }}
                />
            )}

            {incomingImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url("${incomingImage}")`,
                        opacity: isFading ? 1 : 0,
                        transition: `opacity ${duration}ms ease-in-out`,
                    }}
                />
            )}
        </div>
    );
}