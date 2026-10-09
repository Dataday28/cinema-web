import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPlaybackSession, getSubtitleBlobUrl } from '../../services/jellyfin/playback';
import type { PlaybackSession } from '../../types/playback';
import { ticksToSeconds, secondsToTicks } from '../../utils/time';
import {
    reportPlaybackStart,
    reportPlaybackProgress,
    reportPlaybackStopped,
} from '../../services/jellyfin/playback';
import Hls from 'hls.js';
import { PlayerControls } from '../../components/player/PlayerControls';
import { useNavigate } from 'react-router-dom';
import { PlayerHeader } from '../../components/player/PlayerHeader';
import type { SubtitleSize } from '../../types/media';
import { SubtitleOverlay } from '../../components/player/SubtitleOverlay';
import { PlayerFeedback, type PlayerFeedbackType } from '../../components/player/PlayerFeedback';
import { getTrickplayTile } from '../../services/jellyfin/trickplay';

interface WatchProps {
    itemId: string;
    onClose: () => void;
}

export function Watch({
    itemId,
    onClose,
}: WatchProps) {

    const { session } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playback, setPlayback] = useState<PlaybackSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasReportedStart = useRef(false);
    const hasReportedStop = useRef(false);
    const [selectedAudioStreamIndex, setSelectedAudioStreamIndex] = useState<number | undefined>(undefined);
    const pendingSeekRef = useRef<number | null>(null);
    const [selectedSubtitleStreamIndex, setSelectedSubtitleStreamIndex] = useState<number | undefined>(undefined);
    const [subtitleBlobUrl, setSubtitleBlobUrl] = useState<string | null>(null);
    const selectedSubtitleTrack =
        playback?.subtitleTracks.find(
            track =>
                track.index ===
                selectedSubtitleStreamIndex
        );

    const playerRef =
        useRef<HTMLDivElement>(
            null
        );

    const [
        isPlaying,
        setIsPlaying
    ] = useState(false);

    const [
        currentTime,
        setCurrentTime
    ] = useState(0);

    const [
        duration,
        setDuration
    ] = useState(0);

    const [
        volume,
        setVolume
    ] = useState(() => {
        const saved =
            localStorage.getItem(
                'player-volume'
            );

        if (saved === null) {
            return 1;
        }

        const parsed =
            Number(saved);

        if (
            !Number.isFinite(parsed)
        ) {
            return 1;
        }

        return Math.min(
            Math.max(parsed, 0),
            1
        );
    });

    const [
        isMuted,
        setIsMuted
    ] = useState(() => {
        return (
            localStorage.getItem(
                'player-muted'
            ) === 'true'
        );
    });

    const [
        controlsVisible,
        setControlsVisible
    ] = useState(true);

    const controlsTimeoutRef =
        useRef<number | null>(null);

    const navigate =
        useNavigate();

    const [
        playerMenuOpen,
        setPlayerMenuOpen
    ] = useState(false);

    const [
        isFullscreen,
        setIsFullscreen
    ] = useState(false);

    const playerTitle =
        playback?.seriesName ??
        playback?.title;

    const playerSubtitle =
        playback?.seriesName
            ? [
                playback.seasonName,
                playback.episodeNumber !== undefined
                    ? `E${playback.episodeNumber}`
                    : undefined,
                playback.title,
            ]
                .filter(Boolean)
                .join(' · ')
            : undefined;

    const [
        subtitleSize,
        setSubtitleSize
    ] = useState<SubtitleSize>(() => {
        const saved =
            localStorage.getItem(
                'player-subtitle-size'
            );

        if (
            saved === 'small' ||
            saved === 'medium' ||
            saved === 'large'
        ) {
            return saved;
        }

        return 'medium';
    });

    const [
        subtitleLines,
        setSubtitleLines
    ] = useState<string[]>([]);

    const [
        subtitleTrackElement,
        setSubtitleTrackElement
    ] =
        useState<HTMLTrackElement | null>(
            null
        );

    const [
        playerFeedback,
        setPlayerFeedback
    ] = useState<PlayerFeedbackType | null>(
        null
    );

    const feedbackTimeoutRef =
        useRef<number | null>(null);

    const [
        isBuffering,
        setIsBuffering
    ] = useState(false);

    const videoClickTimeoutRef =
        useRef<number | null>(null);

    const trickplayCacheRef =
        useRef<
            Map<number, string>
        >(
            new Map()
        );

    const handleGetTrickplayImage =
        useCallback(
            async (
                tileIndex: number
            ): Promise<string> => {
                const cached =
                    trickplayCacheRef.current
                        .get(tileIndex);

                if (cached) {
                    return cached;
                }

                if (
                    !playback?.trickplay ||
                    !playback.mediaSourceId
                ) {
                    throw new Error(
                        'Trickplay no disponible'
                    );
                }

                const blob =
                    await getTrickplayTile(
                        itemId,
                        session?.accessToken ?? '',
                        playback.mediaSourceId,
                        playback.trickplay.width,
                        tileIndex
                    );

                const url =
                    URL.createObjectURL(
                        blob
                    );

                trickplayCacheRef.current
                    .set(
                        tileIndex,
                        url
                    );

                return url;
            },
            [
                itemId,
                playback?.mediaSourceId,
                playback?.trickplay,
            ]
        );

    const handleTimeUpdate = () => {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        setCurrentTime(
            video.currentTime
        );
    };

    const handleDurationChange = () => {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        setDuration(
            video.duration || 0
        );
    };

    const handleLoadedMetadata = () => {
        const video =
            videoRef.current;

        if (!video || !playback) {
            return;
        }

        if (
            pendingSeekRef.current !== null
        ) {
            video.currentTime =
                pendingSeekRef.current;

            pendingSeekRef.current =
                null;

            return;
        }

        const startSeconds =
            ticksToSeconds(
                playback
                    .startPositionTicks
            );

        if (
            startSeconds <= 0 ||
            startSeconds >=
            video.duration - 10
        ) {
            return;
        }

        video.currentTime =
            startSeconds;
    };

    const handlePlayPause = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        if (video.paused) {
            void video.play();

            showPlayerFeedback(
                'play'
            );
        } else {
            video.pause();

            showPlayerFeedback(
                'pause'
            );
        }
    };

    const handleSeek = (
        time: number
    ) => {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        video.currentTime =
            time;

        setCurrentTime(
            time
        );
    };

    const handleVolumeChange = (
        value: number
    ) => {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        video.volume =
            value;

        video.muted =
            false;

        setVolume(value);
        setIsMuted(false);

        localStorage.setItem(
            'player-volume',
            String(value)
        );

        localStorage.setItem(
            'player-muted',
            'false'
        );
    };

    const handleMuteToggle = () => {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        const nextMuted =
            !video.muted;

        video.muted =
            nextMuted;

        setIsMuted(
            nextMuted
        );

        localStorage.setItem(
            'player-muted',
            String(nextMuted)
        );
    };

    const handleFullscreen = async () => {
        if (!playerRef.current) {
            return;
        }

        if (!document.fullscreenElement) {
            await playerRef.current
                .requestFullscreen();
        } else {
            await document
                .exitFullscreen();
        }
    };

    const showControls = () => {
        setControlsVisible(true);

        if (
            controlsTimeoutRef.current !== null
        ) {
            window.clearTimeout(
                controlsTimeoutRef.current
            );
        }

        if (
            isPlaying &&
            !playerMenuOpen
        ) {
            controlsTimeoutRef.current =
                window.setTimeout(() => {
                    setControlsVisible(
                        false
                    );
                }, 3000);
        }
    };

    const handleSkip = (
        seconds: number
    ) => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        const nextTime =
            Math.min(
                Math.max(
                    video.currentTime + seconds,
                    0
                ),
                video.duration || Infinity
            );

        video.currentTime = nextTime;

        setCurrentTime(nextTime);

        showPlayerFeedback(
            seconds < 0
                ? 'backward'
                : 'forward'
        );

        showControls();
    };
    const handleSubtitleSizeChange = (
        size: SubtitleSize
    ) => {
        setSubtitleSize(
            size
        );

        localStorage.setItem(
            'player-subtitle-size',
            size
        );
    };

    const showPlayerFeedback = (
        type: PlayerFeedbackType
    ) => {
        setPlayerFeedback(type);

        if (feedbackTimeoutRef.current !== null) {
            window.clearTimeout(
                feedbackTimeoutRef.current
            );
        }

        feedbackTimeoutRef.current =
            window.setTimeout(() => {
                setPlayerFeedback(null);
            }, 500);
    };

    const handleVideoClick = () => {
        if (
            videoClickTimeoutRef.current !==
            null
        ) {
            window.clearTimeout(
                videoClickTimeoutRef.current
            );
        }

        videoClickTimeoutRef.current =
            window.setTimeout(() => {
                handlePlayPause();

                videoClickTimeoutRef.current =
                    null;
            }, 220);
    };

    const handleVideoDoubleClick = () => {
        if (
            videoClickTimeoutRef.current !==
            null
        ) {
            window.clearTimeout(
                videoClickTimeoutRef.current
            );

            videoClickTimeoutRef.current =
                null;
        }

        void handleFullscreen();
    };

    useEffect(() => {
        return () => {
            if (
                feedbackTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    feedbackTimeoutRef.current
                );
            }

            if (
                videoClickTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    videoClickTimeoutRef.current
                );
            }

            if (
                controlsTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    controlsTimeoutRef.current
                );
            }
        };
    }, []);
    

    useEffect(() => {
        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            'hidden';

        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, []);

    useEffect(() => {
        if (!isPlaying) {
            setControlsVisible(true);
            return;
        }

        showControls();
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            if (
                controlsTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    controlsTimeoutRef.current
                );
            }
        };
    }, []);

    useEffect(() => {

        if (!session) {
            return;
        }

        let cancelled = false;

        const load = async () => {

            setIsLoading(true);
            setError(null);

            try {

                const result = await getPlaybackSession(
                    itemId,
                    {
                        accessToken:
                            session.accessToken,

                        userId:
                            session.userId,

                        audioStreamIndex:
                            selectedAudioStreamIndex,


                        mediaSourceId:
                            selectedAudioStreamIndex !== undefined
                                ? playback?.mediaSourceId
                                : undefined,
                    }
                );

                if (!cancelled) {
                    setPlayback(result);
                }

            } catch (error) {

                console.error('Playback error:', error);

                if (!cancelled) {
                    setError('No se pudo iniciar la reproducción.');
                }

            } finally {

                if (!cancelled) {
                    setIsLoading(false);
                }

            }

        };

        load();

        return () => {
            cancelled = true;
        };

    }, [itemId, session, selectedAudioStreamIndex]);

    useEffect(() => {

        if (
            !playback ||
            !session
        ) {
            return;
        }

        const interval = window.setInterval(async () => {
            const video = videoRef.current;

            if (
                !video ||
                video.paused ||
                video.ended
            ) {
                return;
            }

            try {

                await reportPlaybackProgress({
                    accessToken: session.accessToken,
                    itemId: playback.itemId,
                    mediaSourceId: playback.mediaSourceId,
                    playSessionId: playback.playSessionId,
                    positionTicks: secondsToTicks(video.currentTime),
                    isPaused: false,
                    method: playback.method,
                });

            } catch (error) {
                console.error('Error reportando progreso:', error);
            }
        },
            10_000
        );

        return () => {
            window.clearInterval(
                interval
            );
        };

    }, [playback, session]);

    useEffect(() => {
        hasReportedStart.current = false;
        hasReportedStop.current = false;

    }, [itemId]);

    useEffect(() => {

        const video = videoRef.current;

        if (!video || !playback) {
            return;
        }

        let hls: Hls | null = null;

        if (playback.isHls) {

            if (Hls.isSupported()) {

                hls = new Hls();
                hls.loadSource(playback.streamUrl);
                hls.attachMedia(video);

                hls.on(
                    Hls.Events.MANIFEST_PARSED,
                    () => {

                        video
                            .play()
                            .catch((error) => {

                                console.warn(
                                    'Autoplay bloqueado:',
                                    error
                                );

                            });

                    }
                );

                hls.on(
                    Hls.Events.ERROR,
                    (
                        _event,
                        data
                    ) => {

                        console.error(
                            'HLS error:',
                            data
                        );

                        if (!data.fatal) {
                            return;
                        }

                        switch (data.type) {

                            case Hls.ErrorTypes.NETWORK_ERROR:

                                console.warn(
                                    'Intentando recuperar HLS por error de red'
                                );

                                hls?.startLoad();

                                break;

                            case Hls.ErrorTypes.MEDIA_ERROR:

                                console.warn(
                                    'Intentando recuperar HLS por error multimedia'
                                );

                                hls?.recoverMediaError();

                                break;

                            default:

                                console.error(
                                    'Error HLS no recuperable'
                                );

                                hls?.destroy();

                                break;
                        }

                    }
                );


            } else if (
                video.canPlayType(
                    'application/vnd.apple.mpegurl'
                )
            ) {

                // Safari / HLS nativo
                video.src =
                    playback.streamUrl;

            } else {
                console.error('Este navegador no soporta HLS');
            }

        } else {
            // Direct Play
            video.src = playback.streamUrl;
        }

        return () => {

            if (hls) {
                hls.destroy();
            }

            video.removeAttribute(
                'src'
            );

            video.load();
        };

    }, [playback]);

    useEffect(() => {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        const textTracks =
            video.textTracks;

        const availableSubtitleTracks =
            playback?.subtitleTracks.filter(
                track =>
                    track.deliveryUrl
            );

        for (
            let i = 0;
            i < textTracks.length;
            i++
        ) {
            const subtitle =
                availableSubtitleTracks![i];

            textTracks[i].mode =
                subtitle?.index ===
                    selectedSubtitleStreamIndex
                    ? 'showing'
                    : 'disabled';
        }

    }, [
        playback?.subtitleTracks,
        selectedSubtitleStreamIndex,
    ]);

    useEffect(() => {
        if (
            !selectedSubtitleTrack?.deliveryUrl ||
            !session
        ) {
            setSubtitleBlobUrl(null);
            return;
        }

        let cancelled = false;
        let objectUrl: string | null = null;

        const loadSubtitle = async () => {
            setSubtitleBlobUrl(null);
            setSubtitleLines([]);

            try {
                const url =
                    await getSubtitleBlobUrl(
                        selectedSubtitleTrack.deliveryUrl!,
                        session.accessToken
                    );

                if (cancelled) {
                    URL.revokeObjectURL(url);
                    return;
                }

                objectUrl = url;
                setSubtitleBlobUrl(url);

            } catch (error) {
                console.error(
                    'Error cargando subtítulos:',
                    error
                );

                setSubtitleBlobUrl(null);
            }
        };

        loadSubtitle();

        return () => {
            cancelled = true;

            if (objectUrl) {
                const urlToRevoke =
                    objectUrl;

                setTimeout(() => {
                    URL.revokeObjectURL(
                        urlToRevoke
                    );
                }, 1000);
            }
        };

    }, [
        selectedSubtitleTrack?.deliveryUrl,
        session,
        playback?.playSessionId,
    ]);

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            const video =
                videoRef.current;

            if (!video) {
                return;
            }

            switch (event.key) {

                case ' ':
                    event.preventDefault();
                    handlePlayPause();
                    break;

                case 'ArrowLeft':
                    event.preventDefault();
                    handleSkip(-10);
                    break;

                case 'ArrowRight':
                    event.preventDefault();
                    handleSkip(10);
                    break;

                case 'm':
                case 'M':
                    handleMuteToggle();
                    break;

                case 'f':
                case 'F':
                    void handleFullscreen();
                    break;
            }

            showControls();
        };

        window.addEventListener(
            'keydown',
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [
        isPlaying,
    ]);

    useEffect(() => {
        if (playerMenuOpen) {
            setControlsVisible(true);
        }
    }, [playerMenuOpen]);

    useEffect(() => {
        const handleFullscreenChange =
            () => {
                setIsFullscreen(
                    Boolean(
                        document.fullscreenElement
                    )
                );
            };

        document.addEventListener(
            'fullscreenchange',
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange
            );
        };
    }, []);

    useEffect(() => {
        if (
            !subtitleTrackElement ||
            !subtitleBlobUrl
        ) {
            setSubtitleLines([]);
            return;
        }

        const textTrack =
            subtitleTrackElement.track;

        // console.log(
        //     'SUB: TextTrack encontrado',
        //     {
        //         mode: textTrack.mode,
        //         language: textTrack.language,
        //         label: textTrack.label,
        //         cues: textTrack.cues?.length,
        //     }
        // );

        textTrack.mode =
            'hidden';

        const updateCues = () => {
            const activeCues =
                textTrack.activeCues;

            const lines: string[] =
                [];

            if (activeCues) {
                for (
                    let i = 0;
                    i < activeCues.length;
                    i++
                ) {
                    const cue =
                        activeCues[i];

                    if (
                        cue instanceof
                        VTTCue
                    ) {
                        const cueLines =
                            cue.text
                                .split(
                                    /\r?\n/
                                )
                                .map(
                                    line =>
                                        line.trim()
                                )
                                .filter(
                                    Boolean
                                );

                        lines.push(
                            ...cueLines
                        );
                    }
                }
            }

            // console.log(
            //     'SUB active:',
            //     lines
            // );

            setSubtitleLines(
                lines
            );
        };

        textTrack.addEventListener(
            'cuechange',
            updateCues
        );

        updateCues();

        return () => {
            textTrack.removeEventListener(
                'cuechange',
                updateCues
            );

            setSubtitleLines([]);
        };
    }, [
        subtitleTrackElement,
        subtitleBlobUrl,
    ]);

    useEffect(() => {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        video.volume =
            volume;

        video.muted =
            isMuted;
    }, [
        playback?.playSessionId,
    ]);

    useEffect(() => {
        const cache =
            trickplayCacheRef.current;

        return () => {
            for (
                const url
                of cache.values()
            ) {
                URL.revokeObjectURL(
                    url
                );
            }

            cache.clear();
        };
    }, [
        itemId
    ]);

    const handlePlay = async () => {
        setIsPlaying(true);
        const video = videoRef.current;

        if (
            !video ||
            !playback ||
            !session ||
            hasReportedStart.current
        ) {
            return;
        }

        hasReportedStart.current = true;

        try {

            await reportPlaybackStart({
                accessToken: session.accessToken,
                itemId: playback.itemId,
                mediaSourceId: playback.mediaSourceId,
                playSessionId: playback.playSessionId,
                positionTicks: secondsToTicks(video.currentTime),
                method: playback.method,
            });

        } catch (error) {
            console.error('Error reportando inicio:', error);
        }
    };

    const handlePause = async () => {
        setIsPlaying(false);
        const video = videoRef.current;

        if (
            !video ||
            !playback ||
            !session ||
            video.ended
        ) {
            return;
        }

        try {
            await reportPlaybackProgress({
                accessToken: session.accessToken,
                itemId: playback.itemId,
                mediaSourceId: playback.mediaSourceId,
                playSessionId: playback.playSessionId,
                positionTicks: secondsToTicks(video.currentTime),
                isPaused: true,
                method: playback.method,
            });
        } catch (error) {
            console.error('Error reportando pausa:', error);
        }
    };

    const stopPlayback = async () => {

        const video = videoRef.current;

        if (
            !video ||
            !playback ||
            !session ||
            hasReportedStop.current
        ) {
            return;
        }

        hasReportedStop.current = true;

        try {

            await reportPlaybackStopped({
                accessToken: session.accessToken,
                itemId: playback.itemId,
                mediaSourceId: playback.mediaSourceId,
                playSessionId: playback.playSessionId,
                positionTicks: secondsToTicks(video.currentTime),
                method: playback.method,
            });

        } catch (error) {
            console.error('Error reportando parada:', error);
        }
    };

    // const handleClose = async () => {
    //     await stopPlayback();
    //     onClose();
    // };

    const handleEnded = async () => {
        await stopPlayback();
        onClose();
    };

    const handleAudioChange = (
        audioStreamIndex: number
    ) => {

        // console.log(
        //     'Cambio de audio:',
        //     audioStreamIndex
        // );
        const video =
            videoRef.current;

        if (video) {
            pendingSeekRef.current =
                video.currentTime;
        }

        setSelectedAudioStreamIndex(
            audioStreamIndex
        );
    };

    const handleSubtitleChange = (
        subtitleStreamIndex?: number
    ) => {
        setSelectedSubtitleStreamIndex(
            subtitleStreamIndex
        );

        if (
            subtitleStreamIndex ===
            undefined
        ) {
            setSubtitleLines([]);
        }
    };
    

    if (isLoading && !playback) {
        return (
            <div
                className="
                    fixed inset-0 z-300
                    flex
                    items-center
                    justify-center
                    bg-black
                    text-white
                    "
            >
                Cargando reproducción...
            </div>
        );
    }

    if (error || !playback) {
        return (
            <div
                className="
                    fixed inset-0 z-300
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-4
                    bg-black
                    text-white
                    "
            >
                <p>
                    {error ??
                        'No hay fuente de reproducción.'}
                </p>

                <button
                    onClick={onClose}
                    className="
                        rounded-md
                        bg-white
                        px-5 py-2
                        text-black
                    "
                >
                    Volver
                </button>
            </div>
        );
    }


    return (
        <div
            ref={playerRef}
            data-subtitle-size={
                subtitleSize
            }
            onMouseMove={showControls}
            onMouseLeave={() => {
                if (isPlaying) {
                    setControlsVisible(false);
                }
            }}
            className={`
                fixed
                inset-0
                z-100
                overflow-hidden
                bg-black

                ${controlsVisible
                            ? 'cursor-default'
                            : 'cursor-none'
                        }
            `}
        >

            {isBuffering && (
                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        z-20
                        flex
                        items-center
                        justify-center
                    "
                >
                    <div
                        className="
                            h-15
                            w-15
                            animate-spin
                            rounded-full
                            border-6
                            border-white/25
                            border-t-amber-400
                        "
                    />
                </div>
            )}

            <video
                ref={videoRef}

                onClick={
                    handleVideoClick
                }

                onDoubleClick={
                    handleVideoDoubleClick
                }

                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={handleEnded}

                onTimeUpdate={
                    handleTimeUpdate
                }

                onDurationChange={
                    handleDurationChange
                }

                onLoadedMetadata={
                    handleLoadedMetadata
                }

                onWaiting={() =>
                    setIsBuffering(true)
                }
                onCanPlay={() =>
                    setIsBuffering(false)
                }
                onPlaying={() =>
                    setIsBuffering(false)
                }

                autoPlay
                className="
                    h-full
                    w-full
                    object-contain
                    bg-black
                "
            >

                {subtitleBlobUrl && (
                    <track
                        ref={
                            setSubtitleTrackElement
                        }
                        key={`${playback.playSessionId}-${selectedSubtitleStreamIndex}`}
                        kind="subtitles"
                        src={subtitleBlobUrl}
                        srcLang={
                            selectedSubtitleTrack?.language ??
                            'und'
                        }
                        label={
                            selectedSubtitleTrack?.title ??
                            selectedSubtitleTrack?.language ??
                            'Subtítulos'
                        }
                    />
                )}

            </video>

            <SubtitleOverlay
                lines={
                    subtitleLines
                }
                size={
                    subtitleSize
                }
                controlsVisible={
                    controlsVisible
                }
            />

            <PlayerFeedback
                type={playerFeedback}
            />

            <div
                className={`
                    absolute
                    inset-x-0
                    top-0
                    z-30

                    bg-linear-to-b
                    from-black/70
                    to-transparent

                    px-6
                    pb-16
                    pt-6

                    transition-opacity
                    duration-300

                    ${controlsVisible
                        ? 'opacity-100'
                        : 'pointer-events-none opacity-0'
                    }
                `}
            >

                <PlayerHeader
                    title={
                        playerTitle ?? ''
                    }
                    subtitle={
                        playerSubtitle
                    }
                    visible={
                        controlsVisible
                    }
                    onBack={() =>
                        navigate(-1)
                    }
                />
            </div>

            <div
                className={`
                    transition-all
                    duration-300

                    ${controlsVisible
                        ? 'opacity-100 translate-y-0'
                        : 'pointer-events-none opacity-0 translate-y-3'
                    }
                `}
            >
                <PlayerControls
                    isPlaying={
                        isPlaying
                    }

                    currentTime={
                        currentTime
                    }

                    duration={
                        duration
                    }

                    volume={
                        volume
                    }

                    isMuted={
                        isMuted
                    }

                    onPlayPause={
                        handlePlayPause
                    }

                    onSeek={
                        handleSeek
                    }

                    onVolumeChange={
                        handleVolumeChange
                    }

                    onMuteToggle={
                        handleMuteToggle
                    }

                    onFullscreen={
                        handleFullscreen
                    }

                    audioTracks={
                        playback.audioTracks
                    }

                    subtitleTracks={
                        playback.subtitleTracks
                    }

                    selectedAudioStreamIndex={
                        selectedAudioStreamIndex ??
                        playback.selectedAudioStreamIndex
                    }

                    selectedSubtitleStreamIndex={
                        selectedSubtitleStreamIndex
                    }

                    onAudioChange={
                        handleAudioChange
                    }

                    onSubtitleChange={
                        handleSubtitleChange
                    }

                    onMenuOpenChange={
                        setPlayerMenuOpen
                    }

                    onSkip={handleSkip}

                    isFullscreen={isFullscreen}
                    
                    subtitleSize={
                        subtitleSize
                    }

                    onSubtitleSizeChange={
                        handleSubtitleSizeChange
                    }

                    trickplay={
                        playback.trickplay
                    }

                    getTrickplayImage={
                        handleGetTrickplayImage
                    }
                />
            </div>


        </div>
    );
}