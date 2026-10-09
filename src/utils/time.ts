export const TICKS_PER_SECOND =
    10_000_000;

export function ticksToSeconds(
    ticks?: number
): number {

    if (!ticks) {
        return 0;
    }

    return ticks / TICKS_PER_SECOND;
}

export function secondsToTicks(
    seconds: number
): number {

    return Math.floor(
        seconds * TICKS_PER_SECOND
    );
}

export function formatPlayerTime(
    seconds: number
): string {

    if (
        !Number.isFinite(seconds)
    ) {
        return '0:00';
    }

    const totalSeconds =
        Math.max(
            0,
            Math.floor(seconds)
        );

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (
                totalSeconds % 3600
            ) / 60
        );

    const remainingSeconds =
        totalSeconds % 60;

    if (hours > 0) {
        return [
            hours,
            minutes
                .toString()
                .padStart(2, '0'),
            remainingSeconds
                .toString()
                .padStart(2, '0'),
        ].join(':');
    }

    return [
        minutes,
        remainingSeconds
            .toString()
            .padStart(2, '0'),
    ].join(':');
}