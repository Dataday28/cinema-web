import { useMemo } from 'react';
import type { MediaItem } from '../types/media';

export interface GenreRow {
    id: string;
    title: string;
    items: MediaItem[];
}

interface GenreConfig {
    id: string;
    title: string;
    aliases: string[];
}

const GENRES: GenreConfig[] = [
    {
        id: 'action',
        title: 'Acción y aventura',
        aliases: ['Action', 'Adventure', 'Acción', 'Aventura'],
    },
    {
        id: 'scifi',
        title: 'Ciencia ficción',
        aliases: ['Science Fiction', 'Sci-Fi', 'Ciencia ficción'],
    },
    {
        id: 'thriller',
        title: 'Suspenso',
        aliases: ['Thriller', 'Suspense', 'Suspenso'],
    },
    {
        id: 'horror',
        title: 'Terror',
        aliases: ['Horror', 'Terror'],
    },
    {
        id: 'comedy',
        title: 'Comedia',
        aliases: ['Comedy', 'Comedia'],
    },
    {
        id: 'drama',
        title: 'Drama',
        aliases: ['Drama'],
    },
    {
        id: 'animation',
        title: 'Animación',
        aliases: ['Animation', 'Animación'],
    },
    {
        id: 'fantasy',
        title: 'Fantasía',
        aliases: ['Fantasy', 'Fantasía'],
    },
    {
        id: 'mystery',
        title: 'Misterio',
        aliases: ['Mystery', 'Misterio'],
    },
    {
        id: 'documentary',
        title: 'Documentales',
        aliases: ['Documentary', 'Documental'],
    },
];

function normalize(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export function useGenreRows(
    movies: MediaItem[],
    series: MediaItem[],
    minItems = 4
): GenreRow[] {
    return useMemo(() => {
        const unique = new Map<string, MediaItem>();

        for (const item of [...movies, ...series]) {
            unique.set(item.id, item);
        }

        const items = [...unique.values()];

        return GENRES.map((genre) => {
            const aliases = genre.aliases.map(normalize);

            const matches = items.filter((item) => {
                // Requiere que MediaItem tenga genres: string[]
                const itemGenres = item.genres ?? [];

                return itemGenres.some((name) =>
                    aliases.includes(normalize(name))
                );
            });

            return {
                id: genre.id,
                title: genre.title,
                items: matches,
            };
        }).filter((row) => row.items.length >= minItems);
    }, [movies, series, minItems]);
}