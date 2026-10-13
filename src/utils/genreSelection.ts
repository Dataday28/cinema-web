import type { JellyfinGenre } from '../services/jellyfin/library';

const PREFERRED_GENRES = [
    ['action', 'accion', 'adventure', 'aventura'],
    ['science fiction', 'sci fi', 'ciencia ficcion'],
    ['thriller', 'suspense', 'suspenso'],
    ['horror', 'terror'],
    ['comedy', 'comedia'],
    ['fantasy', 'fantasia'],
    ['animation', 'animacion'],
    ['mystery', 'misterio'],
    ['drama'],
    ['documentary', 'documental'],
];

function normalizeGenre(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function shuffle<T>(items: T[]): T[] {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function getGenreGroup(name: string): string {
    const normalized = normalizeGenre(name);

    const groupIndex = PREFERRED_GENRES.findIndex((aliases) =>
        aliases.includes(normalized)
    );

    return groupIndex >= 0
        ? `preferred-${groupIndex}`
        : normalized;
}

export function selectGenres(
    genres: JellyfinGenre[],
    maxGenres = 8
): JellyfinGenre[] {
    const unique = new Map<string, JellyfinGenre>();

    for (const genre of genres) {
        if (!genre.id || !genre.name) continue;

        const group = getGenreGroup(genre.name);

        if (!unique.has(group)) {
            unique.set(group, genre);
        }
    }

    const available = [...unique.values()];

    const preferred = available.filter((genre) =>
        getGenreGroup(genre.name).startsWith('preferred-')
    );

    const others = available.filter(
        (genre) => !getGenreGroup(genre.name).startsWith('preferred-')
    );

    return [
        ...shuffle(preferred),
        ...shuffle(others),
    ].slice(0, maxGenres);
}