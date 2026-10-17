import {
    DEFAULT_PREVIEW_SETTINGS,
    usePreviewSettings,
    type PreviewLanguage,
} from '../../context/PreviewSettingsContext';

export function PreviewSettingsPanel() {
    const {
        settings,
        updateSettings,
        resetSettings,
    } = usePreviewSettings();

    const selectClass =
        'rounded-lg border border-white/20 bg-zinc-900 px-3 py-2 text-white';

    return (
        <section className="max-w-xl space-y-6 rounded-xl bg-zinc-900 p-6 text-white">
            <div>
                <h2 className="text-xl font-semibold">
                    Vistas previas
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                    Personaliza la reproducción de tráileres.
                </p>
            </div>

            <label className="flex items-center justify-between gap-4">
                <span>Reproducción automática</span>

                <input
                    type="checkbox"
                    checked={settings.autoplay}
                    onChange={(event) =>
                        updateSettings({
                            autoplay: event.target.checked,
                        })
                    }
                    className="h-5 w-5 accent-red-600"
                />
            </label>

            <label className="flex items-center justify-between gap-4">
                <span>Iniciar sin sonido</span>

                <input
                    type="checkbox"
                    checked={settings.startMuted}
                    disabled={!settings.autoplay}
                    onChange={(event) =>
                        updateSettings({
                            startMuted: event.target.checked,
                        })
                    }
                    className="h-5 w-5 accent-red-600"
                />
            </label>

            <label className="flex flex-col gap-2">
                <span>Tiempo de espera</span>

                <select
                    value={settings.delay}
                    disabled={!settings.autoplay}
                    onChange={(event) =>
                        updateSettings({
                            delay: Number(event.target.value),
                        })
                    }
                    className={selectClass}
                >
                    <option value={500}>0.5 segundos</option>
                    <option value={1500}>1.5 segundos</option>
                    <option value={3000}>3 segundos</option>
                </select>
            </label>

            <label className="flex flex-col gap-2">
                <span>Idioma preferido</span>

                <select
                    value={settings.language}
                    disabled={!settings.autoplay}
                    onChange={(event) =>
                        updateSettings({
                            language:
                                event.target.value as PreviewLanguage,
                        })
                    }
                    className={selectClass}
                >
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                    <option value="auto">Automático</option>
                </select>
            </label>

            <button
                type="button"
                onClick={resetSettings}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
                Restaurar valores predeterminados
            </button>

            <p className="text-xs text-zinc-500">
                Configuración inicial: {DEFAULT_PREVIEW_SETTINGS.delay} ms
                de espera.
            </p>
        </section>
    );
}