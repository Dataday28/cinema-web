import {
    Pause,
    Play,
    RotateCcw,
    RotateCw,
} from 'lucide-react';

export type PlayerFeedbackType =
    | 'play'
    | 'pause'
    | 'backward'
    | 'forward';

interface PlayerFeedbackProps {
    type: PlayerFeedbackType | null;
}

export function PlayerFeedback({
    type,
}: PlayerFeedbackProps) {
    if (!type) {
        return null;
    }

    const icon = {
        play: <Play size={42} fill="currentColor" />,
        pause: <Pause size={42} fill="currentColor" />,
        backward: <RotateCcw size={42} />,
        forward: <RotateCw size={42} />,
    }[type];

    const label = {
        play: undefined,
        pause: undefined,
        backward: '10 s',
        forward: '10 s',
    }[type];

    return (
        <div
            className="
                pointer-events-none
                absolute
                inset-0
                z-30
                flex
                items-center
                justify-center
            "
        >
            <div
                className="
                    flex
                    h-24
                    min-w-24
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-black/55
                    px-6
                    text-white
                    backdrop-blur-sm
                    animate-[player-feedback_500ms_ease-out]
                "
            >
                {icon}

                {label && (
                    <span className="text-lg font-semibold">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
}