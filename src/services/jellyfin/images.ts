import { getJellyfinUrl } from './client';

export type JellyfinImageType =
    | 'Primary'
    | 'Backdrop'
    | 'Logo'
    | 'Thumb';

interface ImageOptions {
    width?: number;
    height?: number;
    quality?: number;
}

export function getImageUrl(
    itemId: string,
    type: JellyfinImageType,
    options: ImageOptions = {}
): string {

    const params = new URLSearchParams();

    if (options.width) {
        params.set(
            'maxWidth',
            String(options.width)
        );
    }

    if (options.height) {
        params.set(
            'maxHeight',
            String(options.height)
        );
    }

    if (options.quality) {
        params.set(
            'quality',
            String(options.quality)
        );
    }

    const query = params.toString();

    return (
        `${getJellyfinUrl()}/Items/` +
        `${itemId}/Images/${type}` +
        (query ? `?${query}` : '')
    );
}