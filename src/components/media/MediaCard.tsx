import {
    useEffect,
    useRef,
    useState,
} from 'react';
import type { MediaItem } from '../../types/media';
import { MediaPreview } from './MediaPreview';

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

    const [showPreview, setShowPreview] = useState(false);
    const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);
    const cardRef = useRef<HTMLElement>(null);
    const openTimeout = useRef<number | null>(null);
    const closeTimeout = useRef<number | null>(null);
    
    const handlePreviewMouseEnter = () => {
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
        
        if (closeTimeout.current) {
            window.clearTimeout(closeTimeout.current);
        }

        openTimeout.current = window.setTimeout(() => {
            if (!cardRef.current) return;

            const rect = cardRef.current.getBoundingClientRect();
            const naturalCenterLeft = rect.left + rect.width / 2;
            const halfPreview = PREVIEW_WIDTH / 2;

            // Ajuste de límites para no salir de pantalla
            let left = naturalCenterLeft;
            const minLeft = halfPreview + SCREEN_MARGIN;
            const maxLeft = window.innerWidth - halfPreview - SCREEN_MARGIN;

            // 2. Determinar el origen de la animación (Origin) según colisión
            let transformOrigin = 'origin-center';

            if (left < minLeft) {
                left = minLeft;
                transformOrigin = 'origin-left'; // Crece hacia la derecha
            } else if (left > maxLeft) {
                left = maxLeft;
                transformOrigin = 'origin-right'; // Crece hacia la izquierda
            }

            const top = rect.top + rect.height / 2 + window.scrollY;
            const leftWithScroll = left + window.scrollX;

            // 3. Guardar las coordenadas y el origin
            setPreviewPosition({
                top,
                left: leftWithScroll,
                transformOrigin,
            });

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

    return (
        <article
            ref={cardRef}
            className={`
                relative
                w-[75vw]
                sm:w-70
                md:w-[320px]
                lg:w-69
                shrink-0
                cursor-pointer
                duration-200
                ${showPreview ? 'opacity-0' : 'opacity-100'}
            `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                    item={item}
                    position={previewPosition}
                    onMouseEnter={handlePreviewMouseEnter}
                    onMouseLeave={handlePreviewMouseLeave}
                />
            )}

        </article>
    );
}