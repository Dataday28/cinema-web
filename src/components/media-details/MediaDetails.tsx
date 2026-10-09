import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { useMediaDetails } from '../../context/MediaDetailsContext';
import { MediaDetailsHero } from './MediaDetailsHero';
import { SeriesDetails } from './SeriesDetails';
import { useMediaDetailsData } from '../../hooks/useMediaDetailsData';

export function MediaDetails() {
    const {
        selectedItem,
        isOpen,
        closeMediaDetails,
    } = useMediaDetails();

    const {
        details,
        isLoading,
        error,
    } = useMediaDetailsData(
        selectedItem?.id
    );

    const item =
        details;

    useEffect(() => {
        if (!isOpen) return;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMediaDetails();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [isOpen, closeMediaDetails]);

    if (!isOpen || !selectedItem) {
        return null;
    }

    return createPortal(
        <div
            className="
                fixed inset-0 z-200
                overflow-y-auto
                bg-black/75
                px-4 py-10
                backdrop-blur-sm
            "
            onClick={closeMediaDetails}
        >
            <div
                className="
                    relative
                    mx-auto
                    max-w-5xl
                    overflow-hidden
                    rounded-xl
                    bg-[#181818]
                    text-white
                    shadow-2xl
                    "
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    onClick={closeMediaDetails}
                    className="
                        absolute right-4 top-4 z-50
                        flex h-10 w-10
                        items-center justify-center
                        rounded-full
                        bg-[#181818]
                        text-xl
                        transition
                        hover:bg-[#333]
                        cursor-pointer
                    "
                >
                    ✕
                </button>

                {isLoading && (
                    <div
                        className="
                            absolute
                            left-0
                            right-0
                            top-0
                            z-50
                            h-0.5
                            animate-pulse
                            bg-white/70
                            "
                    />
                )}

                {error && (
                    <p className="px-8 pb-4 text-sm text-red-400">
                        No fue posible cargar toda la información.
                    </p>
                )}

                <MediaDetailsHero item={item ? item : selectedItem} />

                {(selectedItem.type === 'series' || selectedItem.type === 'episode') && (
                    <SeriesDetails series={selectedItem} />
                )}

                {details?.people &&
                    details.people.length > 0 && (
                        <p className="px-8 pb-4 text-sm">
                            <span className="text-gray-500">
                                Reparto:{' '}
                            </span>

                            {details.people
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

                {details?.directors &&
                    details.directors.length > 0 && (
                        <p className="px-8 pb-4 text-sm">
                            <span className="text-gray-500">
                                Dirección:{' '}
                            </span>

                            {details.directors
                                .map(
                                    (person) => person.name
                                )
                                .join(', ')}
                        </p>
                    )}

                {details?.studios &&
                    details.studios.length > 0 && (
                        <p className="px-8 pb-4 text-sm">
                            <span className="text-gray-500">
                                Estudio:{' '}
                            </span>

                            {details.studios.join(', ')}
                        </p>
                    )}

            </div>
        </div>,
        document.body
    );
}