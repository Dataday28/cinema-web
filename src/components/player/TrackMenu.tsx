import type { SubtitleSize } from '../../types/media';
import type {
    AudioTrack,
    SubtitleTrack,
} from '../../types/playback';

interface TrackOptionProps {
    selected: boolean;
    title: string;
    detail?: string;
    onClick: () => void;
}

function formatAudioCodec(
    codec: string
): string {
    switch (
        codec.toLowerCase()
    ) {
        case 'ac3':
            return 'Dolby Digital';

        case 'eac3':
            return 'Dolby Digital Plus';

        case 'truehd':
            return 'Dolby TrueHD';

        case 'aac':
            return 'AAC';

        case 'dts':
            return 'DTS';

        case 'flac':
            return 'FLAC';

        default:
            return codec.toUpperCase();
    }
}

function formatChannels(
    channels: number
): string {
    switch (channels) {
        case 1:
            return 'Mono';

        case 2:
            return 'Estéreo';

        case 6:
            return '5.1';

        case 8:
            return '7.1';

        default:
            return `${channels} canales`;
    }
}

function getLanguageName(
    language?: string
): string {
    if (!language) {
        return 'Desconocido';
    }

    try {
        const names =
            new Intl.DisplayNames(
                ['es'],
                {
                    type:
                        'language',
                }
            );

        const name =
            names.of(language);

        return name
            ? name.charAt(0).toUpperCase() +
            name.slice(1)
            : language;

    } catch {
        return language;
    }
}

function getAudioTitle(
    track: AudioTrack
): string {
    return getLanguageName(
        track.language
    );
}

function getAudioDetail(
    track: AudioTrack
): string {
    const parts: string[] = [];

    if (track.codec) {
        parts.push(
            formatAudioCodec(
                track.codec
            )
        );
    }

    if (track.channels) {
        parts.push(
            formatChannels(
                track.channels
            )
        );
    }

    return parts.join(' · ');
}

function getSubtitleTitle(
    track: SubtitleTrack
): string {
    return getLanguageName(
        track.language
    );
}

function getSubtitleDetail(
    track: SubtitleTrack
): string {
    const parts: string[] = [];

    if (track.isForced) {
        parts.push('Forzado');
    }

    if (
        track.title
            ?.toLowerCase()
            .includes(
                'discapacidad'
            )
    ) {
        parts.push('CC');
    }

    return parts.join(' · ');
}

function TrackOption({
    selected,
    title,
    detail,
    onClick,
}: TrackOptionProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex
                w-full
                items-center
                gap-3
                rounded-lg
                px-3
                py-2.5
                text-left
                transition

                ${selected
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }
            `}
        >
            <span
                className="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                "
            >
                {selected && (
                    <span
                        className="
                            h-2
                            w-2
                            rounded-full
                            bg-white
                        "
                    />
                )}
            </span>

            <span
                className="
                    min-w-0
                    flex-1
                "
            >
                <span
                    className="
                        block
                        truncate
                        text-sm
                        font-medium
                    "
                >
                    {title}
                </span>

                {detail && (
                    <span
                        className="
                            mt-0.5
                            block
                            truncate
                            text-xs
                            text-white/50
                        "
                    >
                        {detail}
                    </span>
                )}
            </span>
        </button>
    );
}

function SubtitleSizeButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className={`
                rounded-md
                px-2
                py-2
                text-xs
                transition

                ${active
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
            `}
        >
            {children}
        </button>
    );
}

interface TrackMenuProps {
    audioTracks: AudioTrack[];
    subtitleTracks: SubtitleTrack[];

    selectedAudioStreamIndex?: number;
    selectedSubtitleStreamIndex?: number;

    onAudioChange: (
        index: number
    ) => void;

    onSubtitleChange: (
        index?: number
    ) => void;

    onClose: () => void;

    subtitleSize: SubtitleSize;

    onSubtitleSizeChange: (
        size: SubtitleSize
    ) => void;
}

export function TrackMenu({
    audioTracks,
    subtitleTracks,
    selectedAudioStreamIndex,
    selectedSubtitleStreamIndex,
    onAudioChange,
    onSubtitleChange,
    onClose,
    subtitleSize,
    onSubtitleSizeChange
}: TrackMenuProps) {

    return (
        <div
            className="
                absolute
                bottom-20
                right-6
                z-50
                w-80
                overflow-hidden
                rounded-xl
                border
                border-white/10
                bg-neutral-950/95
                p-2
                text-white
                shadow-2xl
                backdrop-blur-xl
            "
        >
            <section>
                <h3
                    className="
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-white/60
                    "
                >
                    Audio
                </h3>

                {audioTracks.map(
                    track => (
                        <TrackOption
                            key={
                                track.index
                            }
                            selected={
                                track.index ===
                                selectedAudioStreamIndex
                            }
                            title={
                                getAudioTitle(
                                    track
                                )
                            }
                            detail={
                                getAudioDetail(
                                    track
                                )
                            }
                            onClick={() => {
                                onAudioChange(
                                    track.index
                                );

                                onClose();
                            }}
                        />
                    )
                )}
            </section>

            <div
                className="
                    mx-3
                    my-2
                    h-px
                    bg-white/10
                "
            />

            <section>
                <h3
                    className="
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-white/60
                    "
                >
                    Subtítulos
                </h3>

                <TrackOption
                    selected={
                        selectedSubtitleStreamIndex ===
                        undefined
                    }
                    title="Desactivados"
                    onClick={() => {
                        onSubtitleChange(
                            undefined
                        );

                        onClose();
                    }}
                />

                {subtitleTracks.map(
                    track => (
                        <TrackOption
                            key={
                                track.index
                            }
                            selected={
                                track.index ===
                                selectedSubtitleStreamIndex
                            }
                            title={
                                getSubtitleTitle(
                                    track
                                )
                            }
                            detail={
                                getSubtitleDetail(
                                    track
                                )
                            }
                            onClick={() => {
                                onSubtitleChange(
                                    track.index
                                );

                                onClose();
                            }}
                        />
                    )
                )}

                {selectedSubtitleStreamIndex !==
                    undefined && (
                        <>
                            <div
                                className="
                                    mx-3
                                    my-3
                                    h-px
                                    bg-white/10
                                "
                            />

                            <div
                                className="
                                    px-3
                                    pb-2
                                "
                            >
                                <span
                                    className="
                                        text-xs
                                        font-medium
                                        text-white/50
                                    "
                                >
                                    Tamaño
                                </span>

                                <div
                                    className="
                                        mt-2
                                        grid
                                        grid-cols-3
                                        gap-1
                                        rounded-lg
                                        bg-white/5
                                        p-1
                                    "
                                >
                                    <SubtitleSizeButton
                                        active={
                                            subtitleSize ===
                                            'small'
                                        }
                                        onClick={() =>
                                            onSubtitleSizeChange(
                                                'small'
                                            )
                                        }
                                    >
                                        Pequeño
                                    </SubtitleSizeButton>

                                    <SubtitleSizeButton
                                        active={
                                            subtitleSize ===
                                            'medium'
                                        }
                                        onClick={() =>
                                            onSubtitleSizeChange(
                                                'medium'
                                            )
                                        }
                                    >
                                        Medio
                                    </SubtitleSizeButton>

                                    <SubtitleSizeButton
                                        active={
                                            subtitleSize ===
                                            'large'
                                        }
                                        onClick={() =>
                                            onSubtitleSizeChange(
                                                'large'
                                            )
                                        }
                                    >
                                        Grande
                                    </SubtitleSizeButton>
                                </div>
                            </div>
                        </>
                    )}
            </section>
        </div>
    );
}