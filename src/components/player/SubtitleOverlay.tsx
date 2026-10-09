interface SubtitleOverlayProps {
    lines: string[];
    size: 'small' | 'medium' | 'large';
    controlsVisible: boolean;
}

export function SubtitleOverlay({
    lines,
    size,
    controlsVisible,
}: SubtitleOverlayProps) {
    if (lines.length === 0) {
        return null;
    }

    const sizeClass = {
        small:
            'text-lg sm:text-xl md:text-2xl',

        medium:
            'text-xl sm:text-2xl md:text-3xl',

        large:
            'text-xl sm:text-3xl md:text-4xl',
    }[size];

    return (
        <div
            className={`
                pointer-events-none
                absolute
                inset-x-0
                z-20

                flex
                justify-center

                px-6

                transition-[bottom]
                duration-300

                ${controlsVisible
                    ? 'bottom-32'
                    : 'bottom-10'
                }
            `}
        >
            <div
                className={`
                    max-w-[85%]

                    text-center
                    font-medium
                    leading-snug
                    text-white

                    ${sizeClass}
                `}
                style={{
                    textShadow:
                        '0 2px 4px #000, 0 0 8px #000',
                }}
            >
                {lines.map(
                    (line, index) => (
                        <div
                            key={index}
                            className="
                                mx-auto
                                mb-1
                                w-fit
                                max-w-full
                                rounded-sm
                                bg-black/65
                                px-2
                                py-0.5
                            "
                        >
                            {line}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}