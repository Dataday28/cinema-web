import type { PreviewLanguage } from "../context/PreviewSettingsContext";
import type { TrailerInfo } from "../services/jellyfin/traileres";


function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function getTrailerScore(
    trailer: TrailerInfo,
    language: PreviewLanguage
): number {
    const name = normalizeText(trailer.name);

    let score = 0;

    // if (/\boficial\b|\bofficial\b/.test(name)) {
    //     score += 40;
    // }

    if (/\btrailer\b/.test(name)) {
        score += 15;
    }

    if (/\bteaser\b|\bavance\b|\btv spot\b/.test(name)) {
        score -= 20;
    }

    if (language === 'es') {
        if (/\bdoblad[oa]\b|\blatino\b/.test(name)) {
            score += 35;
        }

        if (/\bespanol\b|\bespana\b/.test(name)) {
            score += 25;
        }

        if (/\bsubtitulado\b|\bsubtitulos\b/.test(name)) {
            score += 10;
        }
    }

    if (language === 'en') {
        if (/\benglish\b|\boriginal version\b|\bvo\b/.test(name)) {
            score += 35;
        }

        if (/\bsubtitled\b/.test(name)) {
            score += 10;
        }
    }

    return score;
}

export function sortTrailers(
    trailers: TrailerInfo[],
    language: PreviewLanguage = 'auto'
): TrailerInfo[] {
    return [...trailers].sort((a, b) => {
        return (
            getTrailerScore(b, language) -
            getTrailerScore(a, language)
        );
    });
}