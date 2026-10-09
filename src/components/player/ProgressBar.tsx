import { useEffect, useRef, useState } from "react";
import { formatPlayerTime } from "../../utils/time";
import type { TrickplayInfo } from "../../types/playback";
import { getTrickplayPosition } from "../../services/jellyfin/trickplay";
import { TrickplayPreview } from "./TrickplayPreview";

interface ProgressBarProps {
    currentTime: number;
    duration: number;

    trickplay?: TrickplayInfo;

    getTrickplayImage?: (
        tileIndex: number
    ) => Promise<string>;

    onSeek: (
        time: number
    ) => void;
}

export function ProgressBar({
    currentTime,
    duration,
    trickplay,
    getTrickplayImage,
    onSeek,
}: ProgressBarProps) {

    const progressRef =
        useRef<HTMLDivElement>(
            null
        );

    const percentage =
        duration > 0
            ? (
                currentTime /
                duration
            ) * 100
            : 0;

    const remaining =
        Math.max(
            duration - currentTime,
            0
        );

    const [
        previewTime,
        setPreviewTime
    ] = useState<number | null>(
        null
    );

    const previewPercentage =
        duration > 0 &&
            previewTime !== null
            ? (
                previewTime /
                duration
            ) * 100
            : 0;

    const displayTime =
        previewTime ??
        currentTime;

    const [
        hoverTime,
        setHoverTime
    ] = useState<number | null>(
        null
    );

    const tooltipTime =
        previewTime ??
        hoverTime;

    const tooltipPercentage =
        duration > 0 &&
            tooltipTime !== null
            ? (
                tooltipTime /
                duration
            ) * 100
            : 0;

    const [
        trickplayImageUrl,
        setTrickplayImageUrl
    ] = useState<string | null>(
        null
    );

    const trickplayPosition =
        tooltipTime !== null &&
            trickplay
            ? getTrickplayPosition(
                tooltipTime,
                trickplay
            )
            : null;

    const currentTileIndex =
        trickplayPosition
            ?.tileIndex;

    useEffect(() => {
        if (
            previewTime !== null &&
            previewTime > duration
        ) {
            setPreviewTime(
                duration
            );
        }
    }, [
        duration,
        previewTime,
    ]);

    useEffect(() => {
        if (
            currentTileIndex ===
            undefined ||
            !getTrickplayImage
        ) {
            setTrickplayImageUrl(
                null
            );

            return;
        }

        let cancelled = false;

        const load = async () => {
            try {
                const url =
                    await getTrickplayImage(
                        currentTileIndex
                    );

                if (!cancelled) {
                    setTrickplayImageUrl(
                        url
                    );
                }
            } catch (error) {
                console.error(
                    'Error cargando Trickplay:',
                    error
                );
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [
        currentTileIndex,
        getTrickplayImage,
    ]);

    const handleChange = (
        event:
            React.ChangeEvent<HTMLInputElement>
    ) => {
        setPreviewTime(
            Number(
                event.target.value
            )
        );
    };

    const handleMouseMove = (
        event:
            React.MouseEvent<HTMLDivElement>
    ) => {
        const element =
            progressRef.current;

        if (
            !element ||
            duration <= 0
        ) {
            return;
        }

        const rect =
            element.getBoundingClientRect();

        const x =
            Math.min(
                Math.max(
                    event.clientX -
                    rect.left,
                    0
                ),
                rect.width
            );

        const percentage =
            x / rect.width;

        setHoverTime(
            percentage *
            duration
        );
    };

    const handleClick = (
        event:
            React.MouseEvent<HTMLDivElement>
    ) => {
        onSeek(
            getTimeFromPointer(
                event.clientX
            )
        );
    };

    const commitSeek = () => {
        if (
            previewTime === null
        ) {
            return;
        }

        onSeek(
            previewTime
        );

        setPreviewTime(
            null
        );
    };

    const getTimeFromPointer = (
        clientX: number
    ) => {
        const element =
            progressRef.current;

        if (
            !element ||
            duration <= 0
        ) {
            return 0;
        }

        const rect =
            element.getBoundingClientRect();

        const x =
            Math.min(
                Math.max(
                    clientX -
                    rect.left,
                    0
                ),
                rect.width
            );

        return (
            x /
            rect.width
        ) * duration;
    };

    return (
        <div
            className="
                group
                flex
                w-full
                items-center
                gap-2
            "
        >
            <span
                className="
                    text-sm
                    tabular-nums
                    text-white/70
                "
            >
                {formatPlayerTime(
                    currentTime
                )}
            </span>

            <div
                ref={progressRef}
                onMouseMove={
                    handleMouseMove
                }
                onMouseLeave={() =>
                    setHoverTime(null)
                }
                onClick={
                    handleClick
                }
                className="
                    relative
                    min-w-0
                    flex-1
                "
            >
                {previewTime !== null && (
                    <div
                        className="
                            pointer-events-none
                            absolute
                            bottom-5
                            z-20
                            -translate-x-1/2
                            rounded-md
                            bg-black/90
                            px-2
                            py-1
                            text-xs
                            font-medium
                            tabular-nums
                            text-white
                            shadow-lg
                        "
                        style={{
                            left:
                                `${previewPercentage}%`,
                        }}
                    >
                        {formatPlayerTime(
                            previewTime
                        )}
                    </div>
                )}

                {tooltipTime !== null &&
                    trickplay &&
                    trickplayPosition &&
                    trickplayImageUrl ? (

                    <TrickplayPreview
                        imageUrl={
                            trickplayImageUrl
                        }

                        width={
                            trickplay.width
                        }

                        height={
                            trickplay.height
                        }

                        tileWidth={
                            trickplay.tileWidth
                        }

                        tileHeight={
                            trickplay.tileHeight
                        }

                        row={
                            trickplayPosition.row
                        }

                        column={
                            trickplayPosition.column
                        }

                        leftPercentage={
                            tooltipPercentage
                        }

                        timeLabel={
                            formatPlayerTime(
                                tooltipTime
                            )
                        }
                    />
                ) : tooltipTime !== null ? (
                    <div
                        className="
                            pointer-events-none
                            absolute
                            bottom-5
                            z-20
                            -translate-x-1/2
                            rounded-md
                            bg-black/90
                            px-2
                            py-1
                            text-xs
                            font-medium
                            tabular-nums
                            text-white
                            shadow-lg
                        "
                        style={{
                            left:
                                `${tooltipPercentage}%`,
                        }}
                    >
                        {formatPlayerTime(
                            tooltipTime
                        )}
                    </div>
                ) : null}

                <input
                    type="range"
                    min={0}
                    max={
                        duration || 0
                    }
                    step={0.1}
                    value={
                        displayTime
                    }
                    onChange={
                        handleChange
                    }
                    onMouseUp={
                        commitSeek
                    }
                    onTouchEnd={
                        commitSeek
                    }
                    className="
                        player-progress
                        block
                        w-full
                        cursor-pointer
                    "
                    style={{
                        '--progress':
                            `${percentage}%`,
                    } as React.CSSProperties}
                />
            </div>

            <span
                className="
                    text-sm
                    tabular-nums
                    text-white/60
                "
            >
                {formatPlayerTime(
                    remaining
                )}
            </span>
        </div>
    );
}