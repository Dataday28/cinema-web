import { PreviewSettingsPanel } from "../../components/settings/PreviewSettingsPanel";


export default function Settings() {
    return (
        <main className="min-h-screen bg-[#101010] px-6 pb-16 pt-28 text-white md:px-12">
            <div className="mx-auto max-w-5xl">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold">
                        Configuración
                    </h1>

                    <p className="mt-2 text-zinc-400">
                        Personaliza tu experiencia de reproducción.
                    </p>
                </header>

                <PreviewSettingsPanel />
            </div>
        </main>
    );
}