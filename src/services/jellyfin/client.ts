import {
    Jellyfin,
    type Api,
} from '@jellyfin/sdk';

const JELLYFIN_URL =
    import.meta.env.VITE_JELLYFIN_URL;

if (!JELLYFIN_URL) {
    throw new Error(
        'VITE_JELLYFIN_URL no está configurada'
    );
}

const jellyfin = new Jellyfin({
    clientInfo: {
        name: 'My Jellyfin Client',
        version: '0.1.0',
    },

    deviceInfo: {
        name: 'Web Browser',
        id: getDeviceId(),
    },
});

export function createJellyfinApi(
    accessToken?: string
): Api {
    return jellyfin.createApi(
        JELLYFIN_URL,
        accessToken
    );
}

export function getJellyfinUrl() {
    return JELLYFIN_URL;
}

function getDeviceId(): string {
    const key = 'jellyfin-device-id';

    let id = localStorage.getItem(key);

    if (!id) {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            id = crypto.randomUUID();
        } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
            // Fallback usando getRandomValues (suele estar disponible en más entornos)
            id = (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: number) =>
                (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
            );
        } else {
            // Fallback alternativo basado en Math.random
            id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        }

        localStorage.setItem(key, id ?? '');
    }

    return id ?? '';
}