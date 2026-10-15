const PREVIEW_EVENT = 'jellyfin-preview-activate';

export function activatePreview(id: string) {
    window.dispatchEvent(
        new CustomEvent<string>(PREVIEW_EVENT, {
            detail: id,
        })
    );
}

export function subscribeToPreview(
    callback: (id: string) => void
): () => void {
    const handler = (event: Event) => {
        callback(
            (event as CustomEvent<string>).detail
        );
    };

    window.addEventListener(PREVIEW_EVENT, handler);

    return () => {
        window.removeEventListener(PREVIEW_EVENT, handler);
    };
}