import { useEffect, useRef, useState } from "react";
import type { AudioTrack, SubtitleTrack, TrickplayInfo } from "../../types/playback";
//import { formatPlayerTime } from "../../utils/time";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { TrackMenu } from "./TrackMenu";
import { Captions, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import type { SubtitleSize } from "../../types/media";

interface ControlButtonProps {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
    active?: boolean;
}

function ControlButton({
    label,
    onClick,
    children,
    active = false,
}: ControlButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                transition
                duration-150
                cursor-pointer

                ${active
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-white/15'
                }
            `}
        >
            {children}
        </button>
    );
}

interface PlayerControlsProps {
    isPlaying: boolean;

    currentTime: number;
    duration: number;

    volume: number;
    isMuted: boolean;

    onPlayPause: () => void;

    onSeek: (
        time: number
    ) => void;

    onVolumeChange: (
        volume: number
    ) => void;

    onMuteToggle: () => void;

    onFullscreen: () => void;

    audioTracks: AudioTrack[];
    subtitleTracks: SubtitleTrack[];

    selectedAudioStreamIndex?: number;
    selectedSubtitleStreamIndex?: number;

    isFullscreen: boolean;

    onAudioChange: (
        index: number
    ) => void;

    onSubtitleChange: (
        index?: number
    ) => void;

    onMenuOpenChange?: (
        open: boolean
    ) => void;

    onSkip: (
        seconds: number
    ) => void;

    subtitleSize: SubtitleSize;

    onSubtitleSizeChange: (
        size: SubtitleSize
    ) => void;

    trickplay?: TrickplayInfo;

    getTrickplayImage?: (
        tileIndex: number
    ) => Promise<string>;
}

export function PlayerControls({
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    onPlayPause,
    onSeek,
    onVolumeChange,
    onMuteToggle,
    onFullscreen,
    audioTracks,
    subtitleTracks,
    selectedAudioStreamIndex,
    selectedSubtitleStreamIndex,
    onAudioChange,
    onSubtitleChange,
    onMenuOpenChange,
    onSkip,
    isFullscreen,
    subtitleSize,
    onSubtitleSizeChange,
    trickplay,
    getTrickplayImage,
}: PlayerControlsProps) {

    const [trackMenuOpen, setTrackMenuOpen] = useState(false);

    const toggleTrackMenu = () => {
        const next =
            !trackMenuOpen;

        setTrackMenuOpen(next);
        onMenuOpenChange?.(next);
    };

    const trackMenuRef =
        useRef<HTMLDivElement>(
            null
        );

    useEffect(() => {
        if (!trackMenuOpen) {
            return;
        }

        const handlePointerDown = (
            event: PointerEvent
        ) => {
            const target =
                event.target;

            if (
                !(target instanceof Node)
            ) {
                return;
            }

            if (
                !trackMenuRef.current
                    ?.contains(target)
            ) {
                setTrackMenuOpen(false);

                onMenuOpenChange?.(
                    false
                );
            }
        };

        document.addEventListener(
            'pointerdown',
            handlePointerDown
        );

        return () => {
            document.removeEventListener(
                'pointerdown',
                handlePointerDown
            );
        };
    }, [
        trackMenuOpen,
        onMenuOpenChange,
    ]);

    useEffect(() => {
        if (!trackMenuOpen) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (
                event.key !== 'Escape'
            ) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            setTrackMenuOpen(false);

            onMenuOpenChange?.(
                false
            );
        };

        window.addEventListener(
            'keydown',
            handleKeyDown,
            true
        );

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown,
                true
            );
        };
    }, [
        trackMenuOpen,
        onMenuOpenChange,
    ]);


    return (
        <div
            className="
                absolute
                inset-x-0
                bottom-0
                z-30
                px-6
                pb-6
                pt-24
                text-white
                bg-linear-to-t
                from-black/90
                via-black/50
                to-transparent
            "
        >

            <ProgressBar
                currentTime={
                    currentTime
                }
                duration={
                    duration
                }

                trickplay={
                    trickplay
                }

                getTrickplayImage={
                    getTrickplayImage
                }
                
                onSeek={
                    onSeek
                }
            />

            <div
                className="
                    mt-7
                    flex
                    items-center
                    gap-4
                "
            >
                <ControlButton
                    label="Retroceder 10 segundos"
                    onClick={() =>
                        onSkip(-10)
                    }
                >
                    <RotateCcw
                        size={38}
                    />
                </ControlButton>

                <ControlButton
                    label={
                        isPlaying
                            ? 'Pausar'
                            : 'Reproducir'
                    }
                    onClick={
                        onPlayPause
                    }
                >
                    {isPlaying ? (
                        <Pause
                            size={38}
                            fill="currentColor"
                        />
                    ) : (
                        <Play
                            size={38}
                            fill="currentColor"
                        />
                    )}
                </ControlButton>

                <ControlButton
                    label="Adelantar 10 segundos"
                    onClick={() =>
                        onSkip(10)
                    }
                >
                    <RotateCw
                        size={38}
                    />
                </ControlButton>

                <VolumeControl
                    volume={
                        volume
                    }
                    isMuted={
                        isMuted
                    }
                    onVolumeChange={
                        onVolumeChange
                    }
                    onMuteToggle={
                        onMuteToggle
                    }
                />

                {/* <div
                    className="
                        text-sm
                        text-white/80
                    "
                >
                    {formatPlayerTime(
                        currentTime
                    )}
                    {' / '}
                    {formatPlayerTime(
                        duration
                    )}
                </div> */}

                <div className="flex-1" />

                <div
                    ref={trackMenuRef}
                    className="relative"
                >

                    <button
                        type="button"
                        onClick={
                            toggleTrackMenu
                        }
                        aria-label="Audio y subtítulos"
                        title="Audio y subtítulos"
                        className={`
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        transition
                        duration-150
                        cursor-pointer

                        ${trackMenuOpen
                                ? 'bg-white text-black'
                                : 'text-white hover:bg-white/15'
                            }
                    `}
                    >
                        <Captions
                            size={38}
                        />
                    </button>

                    {trackMenuOpen && (
                        <TrackMenu
                            audioTracks={
                                audioTracks
                            }
                            subtitleTracks={
                                subtitleTracks
                            }
                            selectedAudioStreamIndex={
                                selectedAudioStreamIndex
                            }
                            selectedSubtitleStreamIndex={
                                selectedSubtitleStreamIndex
                            }
                            onAudioChange={
                                onAudioChange
                            }
                            onSubtitleChange={
                                onSubtitleChange
                            }
                            onClose={() =>
                                setTrackMenuOpen(
                                    false
                                )
                            }
                            subtitleSize={subtitleSize}
                            onSubtitleSizeChange={onSubtitleSizeChange}
                        />
                    )}

                </div>

                <ControlButton
                    label={
                        isFullscreen
                            ? 'Salir de pantalla completa'
                            : 'Pantalla completa'
                    }
                    onClick={
                        onFullscreen
                    }
                >
                    {isFullscreen ? (
                        <Minimize size={30} />
                    ) : (
                        <Maximize size={38} />
                    )}
                </ControlButton>
            </div>


        </div>
    );
}