import type { TrailerInfo } from "../services/jellyfin/traileres";


function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function getTrailerScore(trailer: TrailerInfo): number {
    const name = normalizeText(trailer.name);

    let score = 0;

    // Preferir tráileres oficiales
    // if (/\boficial\b/.test(name)) {
    //     score += 40;
    // }

    // Preferir audio en español
    if (/\bdoblad[oa]\b/.test(name)) {
        score += 35;
    }

    if (/\blatino\b/.test(name)) {
        score += 25;
    }

    if (/\bespanol\b|\bespana\b/.test(name)) {
        score += 20;
    }

    // Subtitulado es válido, pero menos prioritario
    if (/\bsubtitulado\b|\bsubtitulos\b/.test(name)) {
        score += 10;
    }

    // Priorizar tráileres completos
    if (/\btrailer\b/.test(name)) {
        score += 15;
    }

    // Evitar teasers si hay alternativas
    if (/\bteaser\b|\bavance\b|\btv spot\b/.test(name)) {
        score -= 20;
    }

    return score;
}

export function sortTrailers(
    trailers: TrailerInfo[]
): TrailerInfo[] {
    return [...trailers].sort(
        (a, b) => getTrailerScore(b) - getTrailerScore(a)
    );
}