import type { MediaItem } from '../../types/media';
import PlayIcon from '../../assets/play.svg';
import { useMediaDetails } from '../../context/MediaDetailsContext';
import { HeroBackground } from './HeroBackground';

interface HeroProps {
    item: MediaItem;
}

function formatRuntime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m`;
}

export function Hero({ item }: HeroProps) {
    const { openMediaDetails } = useMediaDetails();

    return (
        <section
            className="
                group/hero
                relative
                flex min-h-[88vh]
                w-full
                items-end px-[4%] pb-24 pt-32
                text-white
                bg-cover bg-center
                overflow-hidden
                after:pointer-events-none
                after:absolute
                after:inset-0
                after:bg-[linear-gradient(to_bottom,transparent_45%,#080a0d_100%)]
                after:content-['']
            "
            // style={{
            //     backgroundImage: `
            //         linear-gradient(
            //             to bottom,
            //             rgba(8, 10, 13, 0.5) 0%,
            //             transparent 28%,
            //             transparent 52%,
            //             #080a0d 100%
            //         ),
            //         linear-gradient(
            //             to right,
            //             rgba(0, 0, 0, 0.9) 0%,
            //             rgba(0, 0, 0, 0.6) 40%,
            //             rgba(0, 0, 0, 0.1) 70%
            //         ),
            //         url("${item.backdrop}")
            //     `,
            // }}
        >
            <HeroBackground imageUrl={item.backdrop ?? ''} duration={700} />

            {/* Gradiente lateral para mejorar la legibilidad */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-1
                    bg-linear-to-r
                    from-black/85
                    via-black/40
                    to-transparent
                "
            />

            {/* Gradiente superior */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-1
                    bg-linear-to-b
                    from-black/40
                    via-transparent
                    to-transparent
                "
            />

            <div className="relative z-10 max-w-162.5">

                {item.logo ? (
                    <img
                        src={item.logo}
                        alt={item.title}
                        className="mb-5 max-h-45 max-w-150 object-contain object-left"
                    />
                ) : (
                    <h1 className="mb-5 mt-0 text-[clamp(3rem,6vw,6rem)] leading-[0.95]">
                        {item.title}
                    </h1>
                )}

                <div className="mb-4.5 flex flex-wrap items-center gap-3">

                    {item.year && (
                        <span>{item.year}</span>
                    )}

                    {item.runtime && (
                        <span>
                            {formatRuntime(item.runtime)}
                        </span>
                    )}

                    {item.quality?.resolution && (
                        <span className="rounded-[3px] border border-white/70 px-1.25 py-0.5 text-xs">
                            {item.quality.resolution}
                        </span>
                    )}

                    {item.quality?.hdr && (
                        <span className="rounded-[3px] border border-white/70 px-1.25 py-0.5 text-xs">
                            {item.quality.hdr}
                        </span>
                    )}

                    {item.quality?.audio && (
                        <span>
                            {item.quality.audio}
                        </span>
                    )}

                </div>

                <div
                    className="
                        grid
                        grid-rows-[0fr]
                        opacity-0
                        transition-[grid-template-rows,opacity]
                        duration-500
                        ease-in-out

                        group-hover/hero:grid-rows-[1fr]
                        group-hover/hero:opacity-100

                        group-focus-within/hero:grid-rows-[1fr]
                        group-focus-within/hero:opacity-100
                    "
                >
                    <div className="min-h-0 overflow-hidden">
                        <p
                            className="
                                max-w-xl
                                pb-3
                                text-sm
                                leading-relaxed
                                text-white/80
                                md:text-base
                            "
                        >
                            {item.description}
                        </p>
                    </div>
                </div>

                {/* <p className="max-w-150 text-[1.05rem] leading-normal text-[#eee]">
                    {item.description}
                </p> */}

                <div className="mt-6 flex gap-3">

                    <button className="cursor-pointer rounded-3xl border-0 bg-white px-6 py-4 text-base font-semibold text-black hover:bg-white/90">
                        <img src={PlayIcon} alt="Reproducir" className="mr-2 inline h-4.5 w-4.5" />
                        Reproducir
                    </button>

                    <button 
                        onClick={() => openMediaDetails(item)}
                        className="cursor-pointer rounded-3xl border-0 bg-[rgba(66,65,65,0.86)] px-6 py-4 text-base font-semibold text-white hover:bg-[rgba(66,65,65,0.7)]"
                    >
                        Más info
                    </button>

                </div>

            </div>
        </section>
    );
}