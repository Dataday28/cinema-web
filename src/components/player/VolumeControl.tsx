import { Volume1, Volume2, VolumeX } from "lucide-react";

interface VolumeControlProps {
    volume: number;
    isMuted: boolean;

    onVolumeChange: (
        volume: number
    ) => void;

    onMuteToggle: () => void;
}

export function VolumeControl({
    volume,
    isMuted,
    onVolumeChange,
    onMuteToggle,
}: VolumeControlProps) {

    const VolumeIcon =
        isMuted || volume === 0
            ? VolumeX
            : volume < 0.5
                ? Volume1
                : Volume2;

    return (
        <div
            className="
                group
                flex
                items-center
                gap-2
            "
        >
            <button
                type="button"
                onClick={
                    onMuteToggle
                }
                aria-label={
                    isMuted
                        ? 'Activar sonido'
                        : 'Silenciar'
                }
                className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    transition
                    hover:bg-white/15
                    cursor-pointer
                "
            >
                <VolumeIcon
                    size={38}
                />
            </button>

            <div
                className="
                    w-0
                    overflow-hidden
                    transition-all
                    duration-200
                    group-hover:w-24
                "
            >
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={
                        isMuted
                            ? 0
                            : volume
                    }
                    onChange={
                        event =>
                            onVolumeChange(
                                Number(
                                    event
                                        .target
                                        .value
                                )
                            )
                    }
                    className="
                        w-24
                        cursor-pointer
                    "
                />
            </div>
        </div>
    );
}