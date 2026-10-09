import {
    DlnaProfileType,
    type DeviceProfile,
} from '@jellyfin/sdk/lib/generated-client/models';
import { getBrowserCapabilities } from './browserCapabilities';

export function createWebDeviceProfile(): DeviceProfile {
    const capabilities =
        getBrowserCapabilities();

    const transcodingVideoCodecs = [
        'h264',
    ];

    if (capabilities.hevc) {
        transcodingVideoCodecs.push(
            'hevc'
        );
    }

    console.table({
        hvc1: document
            .createElement('video')
            .canPlayType(
                'video/mp4; codecs="hvc1"'
            ),

        hev1: document
            .createElement('video')
            .canPlayType(
                'video/mp4; codecs="hev1"'
            ),

        codecs:
            getSupportedVideoCodecs(),
    });

    return {
        Name: 'Custom Jellyfin Web',

        MaxStreamingBitrate:40_000_000,

        MaxStaticBitrate: 40_000_000,

        DirectPlayProfiles: [
            {
                Type: DlnaProfileType.Video,
                Container: 'mp4,m4v',
                VideoCodec: 'h264,hevc,av1',
                AudioCodec: 'aac,mp3',
            },

            {
                Type: DlnaProfileType.Video,
                Container: 'webm',
                VideoCodec: 'vp8,vp9,av1',
                AudioCodec: 'vorbis,opus',
            },

            {
                Type: DlnaProfileType.Audio,
                Container: 'mp3,aac,m4a,flac,webm,ogg',
            },
        ],

TranscodingProfiles: [
    {
        Type:
            DlnaProfileType.Video,

        Container:
            capabilities.fmp4Hls
                ? 'mp4'
                : 'ts',

        VideoCodec:
            transcodingVideoCodecs.join(
                ','
            ),

        AudioCodec: 'aac',

        Protocol: 'hls',

        Context: 'Streaming',

        MaxAudioChannels: '2',

        MinSegments: 1,
    },
],

        SubtitleProfiles: [
            {
                Format: 'vtt',
                Method: 'External',
            },

            {
                Format: 'srt',
                Method: 'External',
            },
        ],
    };
}


function canPlayHevc(): boolean {
    const video =
        document.createElement('video');

    const hvc1 =
        video.canPlayType(
            'video/mp4; codecs="hvc1"'
        );

    const hev1 =
        video.canPlayType(
            'video/mp4; codecs="hev1"'
        );

    return (
        hvc1 === 'probably' ||
        hvc1 === 'maybe' ||
        hev1 === 'probably' ||
        hev1 === 'maybe'
    );
}

function getSupportedVideoCodecs() {
    const codecs = [
        'h264',
        'av1',
    ];

    if (canPlayHevc()) {
        codecs.push('hevc');
    }

    return codecs.join(',');
}

// function getSupportedTranscodingVideoCodecs() {
//     const codecs = [
//         'h264',
//     ];

//     if (canPlayHevc()) {
//         codecs.push('hevc');
//     }

//     return codecs.join(',');
// }