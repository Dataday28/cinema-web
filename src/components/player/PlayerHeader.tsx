import {
    ArrowLeft
} from 'lucide-react';

interface PlayerHeaderProps {
    title: string;
    subtitle?: string;

    visible: boolean;

    onBack: () => void;
}

export function PlayerHeader({
    title,
    subtitle,
    visible,
    onBack,
}: PlayerHeaderProps) {
    return (
        <div
            className={`
                absolute
                inset-x-0
                top-0
                z-30

                flex
                items-center
                gap-4

                bg-linear-to-b
                from-black/80
                via-black/30
                to-transparent

                px-6
                pb-20
                pt-6

                transition-all
                duration-300

                ${visible
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-3 pointer-events-none opacity-0'
                }
            `}
        >
            <button
                type="button"
                onClick={
                    onBack
                }
                className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    text-white
                    transition
                    hover:bg-white/15
                    cursor-pointer
                "
                aria-label="Volver"
            >
                <ArrowLeft
                    size={38}
                />
            </button>

            <div className="min-w-0">
                <h1
                    className="
                        truncate
                        text-4xl
                        font-semibold
                        text-white
                    "
                >
                    {title}
                </h1>

                {subtitle && (
                    <p
                        className="
                            mt-0.5
                            truncate
                            text-2xl
                            text-white/60
                        "
                    >
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}