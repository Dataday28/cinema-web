export interface BrowserCapabilities {
    h264: boolean;
    hevc: boolean;
    av1: boolean;

    aac: boolean;
    ac3: boolean;
    eac3: boolean;

    hls: boolean;
    fmp4Hls: boolean;
}

export function getBrowserCapabilities():
    BrowserCapabilities {

    const video =
        document.createElement('video');

    const isWindows =
        navigator.userAgent.includes(
            'Windows'
        );

    const isChromium =
        navigator.userAgent.includes(
            'Chrome'
        ) ||
        navigator.userAgent.includes(
            'Edg/'
        );

    const nativeHevc =
        Boolean(
            video.canPlayType(
                'video/mp4; codecs="hvc1"'
            )
        ) ||
        Boolean(
            video.canPlayType(
                'video/mp4; codecs="hev1"'
            )
        );

    return {
        h264: true,

        hevc:
            nativeHevc ||
            (
                isWindows &&
                isChromium
            ),

        av1:
            Boolean(
                video.canPlayType(
                    'video/mp4; codecs="av01.0.05M.08"'
                )
            ),

        aac: true,

        // Conservador por ahora.
        ac3: false,
        eac3: false,

        hls: true,
        fmp4Hls: true,
    };
}