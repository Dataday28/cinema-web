export type NavigationDirection = 'left' | 'right';
export type VerticalDirection = 'up' | 'down';

export function getAdjacentMediaCard(
    currentCard: HTMLElement,
    direction: NavigationDirection
): HTMLElement | null {
    const row = currentCard.closest<HTMLElement>(
        '[data-media-row="true"]'
    );

    if (!row) return null;

    const cards = Array.from(
        row.querySelectorAll<HTMLElement>(
            '[data-media-card="true"]'
        )
    ).filter((card) => {
        return (
            card.isConnected &&
            card.getClientRects().length > 0 &&
            !card.closest('[aria-hidden="true"]')
        );
    });

    const currentIndex = cards.indexOf(currentCard);

    if (currentIndex === -1) {
        return null;
    }

    const nextIndex =
        direction === 'right'
            ? currentIndex + 1
            : currentIndex - 1;

    return cards[nextIndex] ?? null;
}

function getVisibleMediaCards(
    row: HTMLElement
): HTMLElement[] {
    return Array.from(
        row.querySelectorAll<HTMLElement>(
            '[data-media-card="true"]'
        )
    ).filter((card) => {
        return (
            card.isConnected &&
            card.getClientRects().length > 0 &&
            !card.closest('[aria-hidden="true"]')
        );
    });
}

export function getVerticalMediaCard(
    currentCard: HTMLElement,
    direction: VerticalDirection
): HTMLElement | null {
    const currentRow = currentCard.closest<HTMLElement>(
        '[data-media-row="true"]'
    );

    if (!currentRow) return null;

    const rows = Array.from(
        document.querySelectorAll<HTMLElement>(
            '[data-media-row="true"]'
        )
    ).filter((row) => {
        return (
            row.isConnected &&
            row.getClientRects().length > 0 &&
            !row.closest('[aria-hidden="true"]')
        );
    });

    const currentRowIndex = rows.indexOf(currentRow);

    if (currentRowIndex === -1) return null;

    const step = direction === 'down' ? 1 : -1;

    const currentRect = currentCard.getBoundingClientRect();
    const currentCenterX =
        currentRect.left + currentRect.width / 2;

    for (
        let index = currentRowIndex + step;
        index >= 0 && index < rows.length;
        index += step
    ) {
        const cards = getVisibleMediaCards(rows[index]);

        if (cards.length === 0) continue;

        let nearestCard: HTMLElement | null = null;
        let nearestDistance = Infinity;

        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;

            const distance = Math.abs(
                centerX - currentCenterX
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestCard = card;
            }
        }

        return nearestCard;
    }

    return null;
}