export type PlaybackMethod =
    | 'DirectPlay'
    | 'DirectStream'
    | 'Transcode';

export interface AudioTrack {
    index: number;
    codec?: string;
    language?: string;
    title?: string;
    channels?: number;
    isDefault: boolean;
}

export interface SubtitleTrack {
    index: number;

    codec?: string;
    language?: string;
    title?: string;

    isDefault: boolean;
    isForced: boolean;
    isExternal: boolean;

    deliveryMethod?: string;
    deliveryUrl?: string;
}

export interface TrickplayInfo {
    width: number;
    height: number;

    tileWidth: number;
    tileHeight: number;

    thumbnailCount: number;
    interval: number;

    bandwidth?: number;
}

export interface PlaybackSession {
    itemId: string;
    mediaSourceId: string;
    playSessionId?: string;

    streamUrl: string;

    runtimeTicks?: number;
    startPositionTicks?: number;

    method: PlaybackMethod;
    isHls: boolean;

    container?: string;
    videoCodec?: string;
    audioCodec?: string;

    audioTracks: AudioTrack[];
    selectedAudioStreamIndex?: number;

    subtitleTracks: SubtitleTrack[];
    selectedSubtitleStreamIndex?: number;

    title: string;
    seriesName?: string;
    seasonName?: string;
    episodeNumber?: number;

    trickplay?: TrickplayInfo;
}