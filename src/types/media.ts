export type MediaType = 'movie' | 'series' | 'episode';

export interface MediaQuality {
    resolution?: '720p' | '1080p' | '4K';
    hdr?: 'HDR' | 'HDR10' | 'HDR10+' | 'Dolby Vision';
    audio?: string;
}

export type SubtitleSize =
    | 'small'
    | 'medium'
    | 'large';

export interface MediaItem {
    id: string;
    ParentThumbItemId?: string;
    type: MediaType;

    title: string;
    description?: string;

    year?: number;
    runtime?: number;

    image: string;
    backdrop?: string;
    landscape?: string;
    logo?: string;

    progress?: number;

    genres?: string[];
    cast?: Person[];
    director?: string;

    rating?: number;

    quality?: MediaQuality | undefined;
}

export interface Season {
    id: string;
    seriesId: string;

    seasonNumber: number;
    title: string;

    image?: string;
}

export interface Episode {
    id: string;

    seriesId: string;
    seasonId: string;

    seasonNumber: number;
    episodeNumber: number;

    title: string;
    description?: string;

    image?: string;

    runtime?: number;
    progress?: number;

    watched?: boolean;
}

export interface Person {
    id?: string;
    name: string;
    role?: string;
    type?: string;
    image?: string;
}

export interface MediaDetailsData extends MediaItem {
    tagline?: string;
    officialRating?: string;
    studios?: string[];
    people?: Person[];
    directors?: Person[];
    writers?: Person[];
}