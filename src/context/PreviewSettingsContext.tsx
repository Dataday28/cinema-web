import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

export type PreviewLanguage = 'es' | 'en' | 'auto';

export interface PreviewSettings {
    autoplay: boolean;
    startMuted: boolean;
    delay: number;
    language: PreviewLanguage;
}

interface PreviewSettingsContextValue {
    settings: PreviewSettings;
    updateSettings: (
        changes: Partial<PreviewSettings>
    ) => void;
    resetSettings: () => void;
}

const STORAGE_KEY = 'jellyfin-web-preview-settings';

export const DEFAULT_PREVIEW_SETTINGS: PreviewSettings = {
    autoplay: true,
    startMuted: false,
    delay: 1500,
    language: 'es',
};

const PreviewSettingsContext =
    createContext<PreviewSettingsContextValue | null>(null);

function loadSettings(): PreviewSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return { ...DEFAULT_PREVIEW_SETTINGS };
        }

        const parsed: unknown = JSON.parse(stored);

        if (!parsed || typeof parsed !== 'object') {
            return { ...DEFAULT_PREVIEW_SETTINGS };
        }

        const value = parsed as Record<string, unknown>;

        return {
            autoplay:
                typeof value.autoplay === 'boolean'
                    ? value.autoplay
                    : DEFAULT_PREVIEW_SETTINGS.autoplay,

            startMuted:
                typeof value.startMuted === 'boolean'
                    ? value.startMuted
                    : DEFAULT_PREVIEW_SETTINGS.startMuted,

            delay:
                value.delay === 500 ||
                value.delay === 1500 ||
                value.delay === 3000
                    ? value.delay
                    : DEFAULT_PREVIEW_SETTINGS.delay,

            language:
                value.language === 'es' ||
                value.language === 'en' ||
                value.language === 'auto'
                    ? value.language
                    : DEFAULT_PREVIEW_SETTINGS.language,
        };
    } catch {
        return { ...DEFAULT_PREVIEW_SETTINGS };
    }
}

export function PreviewSettingsProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [settings, setSettings] =
        useState<PreviewSettings>(loadSettings);

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(settings)
            );
        } catch (error) {
            console.warn(
                'No se pudieron guardar las preferencias:',
                error
            );
        }
    }, [settings]);

    const updateSettings = (
        changes: Partial<PreviewSettings>
    ) => {
        setSettings((current) => ({
            ...current,
            ...changes,
        }));
    };

    const resetSettings = () => {
        setSettings({ ...DEFAULT_PREVIEW_SETTINGS });
    };

    return (
        <PreviewSettingsContext.Provider
            value={{
                settings,
                updateSettings,
                resetSettings,
            }}
        >
            {children}
        </PreviewSettingsContext.Provider>
    );
}

export function usePreviewSettings() {
    const context = useContext(PreviewSettingsContext);

    if (!context) {
        throw new Error(
            'usePreviewSettings debe utilizarse dentro de PreviewSettingsProvider'
        );
    }

    return context;
}