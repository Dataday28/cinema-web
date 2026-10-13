import { useEffect, useRef } from 'react';

interface YouTubePreviewProps {
    videoId: string;
    muted: boolean;
    onReady?: () => void;
    onError?: () => void;
}

interface YTPlayer {
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    setVolume(volume: number): void;
    playVideo(): void;
    destroy(): void;
}

interface YTPlayerEvent {
    target: YTPlayer;
    data: number;
}

interface YTNamespace {
    Player: new (
        element: HTMLElement,
        options: {
            videoId: string;
            playerVars: Record<string, number | string>;
            events: {
                onReady: (event: YTPlayerEvent) => void;
                onStateChange: (event: YTPlayerEvent) => void;
                onError: () => void;
            };
        }
    ) => YTPlayer;
}

declare global {
    interface Window {
        YT?: YTNamespace;
        onYouTubeIframeAPIReady?: () => void;
    }
}

let youtubeApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeAPI(): Promise<YTNamespace> {
    if (window.YT?.Player) {
        return Promise.resolve(window.YT);
    }

    if (youtubeApiPromise) {
        return youtubeApiPromise;
    }

    youtubeApiPromise = new Promise<YTNamespace>((resolve, reject) => {
        const previousCallback =
            window.onYouTubeIframeAPIReady;

        const timeout = window.setTimeout(() => {
            reject(new Error('YouTube API timeout'));
        }, 15000);

        window.onYouTubeIframeAPIReady = () => {
            previousCallback?.();
            window.clearTimeout(timeout);

            if (window.YT?.Player) {
                resolve(window.YT);
            } else {
                reject(new Error('YouTube API unavailable'));
            }
        };

        if (!document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]'
        )) {
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.onerror = () => {
                window.clearTimeout(timeout);
                reject(new Error('YouTube API load failed'));
            };

            document.head.appendChild(script);
        }
    }).catch((error) => {
        youtubeApiPromise = null;
        throw error;
    });

    return youtubeApiPromise;
}

export function YouTubePreview({
    videoId,
    muted,
    onReady,
    onError,
}: YouTubePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);

    useEffect(() => {
        let cancelled = false;
        let player: YTPlayer | null = null;

        const initialize = async () => {
            try {
                const YT = await loadYouTubeAPI();

                if (cancelled || !containerRef.current) {
                    return;
                }

                const element = document.createElement('div');
                containerRef.current.appendChild(element);

                player = new YT.Player(element, {
                    videoId,
                    playerVars: {
                        autoplay: 1,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        playsinline: 1,
                        rel: 0,
                        enablejsapi: 1,
                        origin: window.location.origin,
                    },
                    events: {
                        onReady: (event) => {
                            if (cancelled) return;

                            //event.target.mute();
                            event.target.setVolume(70);
                            event.target.playVideo();
                        },
                        onStateChange: (event) => {
                            if (cancelled) return;

                            if (event.data === 1) {
                                onReady?.();
                            }
                        },
                        onError: () => {
                            if (!cancelled) {
                                onError?.();
                            }
                        },
                    },
                });

                playerRef.current = player;
            } catch (error) {
                console.warn('YouTube preview:', error);

                if (!cancelled) {
                    onError?.();
                }
            }
        };

        void initialize();

        return () => {
            cancelled = true;
            playerRef.current = null;

            if (player) {
                player.destroy();
            }

            containerRef.current?.replaceChildren();
        };
    }, [videoId, onReady, onError]);

    useEffect(() => {
        const player = playerRef.current;

        if (!player) return;

        if (muted) {
            player.mute();
        } else {
            player.setVolume(70);
            player.unMute();
        }
    }, [muted]);

    return (
        <div
            ref={containerRef}
            className="
                pointer-events-none
                absolute inset-0
                h-full w-full
                overflow-hidden
                [&_iframe]:h-full
                [&_iframe]:w-full
            "
        />
    );
}