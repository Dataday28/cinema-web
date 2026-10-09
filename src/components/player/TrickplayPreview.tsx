interface TrickplayPreviewProps {
    imageUrl: string;

    width: number;
    height: number;

    tileWidth: number;
    tileHeight: number;

    row: number;
    column: number;

    leftPercentage: number;

    timeLabel: string;
}

export function TrickplayPreview({
    imageUrl,
    width,
    height,
    tileWidth,
    tileHeight,
    row,
    column,
    leftPercentage,
    timeLabel,
}: TrickplayPreviewProps) {
    return (
        <div
            className="
                pointer-events-none
                absolute
                bottom-7
                z-40
                -translate-x-1/2
            "
            style={{
                left:
                    `${leftPercentage}%`,
            }}
        >
            <div
                className="
                    overflow-hidden
                    rounded-md
                    bg-black
                    shadow-[0_8px_30px_rgba(0,0,0,0.75)]
                "
                style={{
                    width,
                    height,
                }}
            >
                <div
                    style={{
                        width,
                        height,

                        backgroundImage:
                            `url("${imageUrl}")`,

                        backgroundRepeat:
                            'no-repeat',

                        backgroundPosition:
                            `-${column * width}px -${row * height}px`,

                        backgroundSize:
                            `${tileWidth * width}px ${tileHeight * height}px`,

                        filter:
                            'brightness(0.95) contrast(1.05)',
                    }}
                />
            </div>

            <div
                className="
                    absolute
                    inset-x-0
                    bottom-0
                    flex
                    justify-center
                    bg-linear-to-t
                    from-black/80
                    via-black/30
                    to-transparent
                    pb-2
                    pt-8
                "
            >
                <span
                    className="
                        text-sm
                        font-medium
                        tabular-nums
                        text-white
                        drop-shadow-md
                    "
                >
                    {timeLabel}
                </span>
            </div>
        </div>
    );
}