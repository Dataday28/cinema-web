function SkeletonCard() {
    return (
        <div
            className="
                w-36
                shrink-0
                sm:w-40
                md:w-44
                lg:w-48
            "
        >
            <div
                className="
                    aspect-2/3
                    w-full
                    animate-pulse
                    rounded-md
                    bg-white/8
                "
            />

            <div className="mt-3 space-y-2">
                <div
                    className="
                        h-3
                        w-4/5
                        animate-pulse
                        rounded
                        bg-white/8
                    "
                />

                <div
                    className="
                        h-2
                        w-2/5
                        animate-pulse
                        rounded
                        bg-white/5
                    "
                />
            </div>
        </div>
    );
}

function SkeletonRow() {
    return (
        <section className="mb-8">
            <div
                className="
                    mb-4
                    h-6
                    w-48
                    animate-pulse
                    rounded
                    bg-white/8
                    mx-4
                    sm:mx-8
                    md:mx-12
                    lg:mx-16
                "
            />

            <div
                className="
                    flex
                    gap-3
                    overflow-hidden
                    px-4
                    sm:px-8
                    md:px-12
                    lg:px-16
                "
            >
                {Array.from({ length: 8 }).map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        </section>
    );
}

function SkeletonHero() {
    return (
        <div
            className="
                relative
                h-[65vh]
                min-h-105
                w-full
                overflow-hidden
                bg-white/4
                md:h-[75vh]
            "
        >
            <div
                className="
                    absolute
                    inset-0
                    animate-pulse
                    bg-linear-to-r
                    from-white/3
                    via-white/6
                    to-transparent
                "
            />

            <div
                className="
                    absolute
                    bottom-20
                    left-4
                    w-[85%]
                    max-w-xl
                    space-y-5
                    sm:left-8
                    md:left-12
                    lg:left-16
                "
            >
                <div
                    className="
                        h-12
                        w-3/4
                        animate-pulse
                        rounded-md
                        bg-white/10
                    "
                />

                <div className="space-y-3">
                    <div className="h-3 w-full animate-pulse rounded bg-white/[0.07]" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-white/[0.07]" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.07]" />
                </div>

                <div className="flex gap-3 pt-3">
                    <div
                        className="
                            h-11
                            w-36
                            animate-pulse
                            rounded-md
                            bg-white/12
                        "
                    />

                    <div
                        className="
                            h-11
                            w-36
                            animate-pulse
                            rounded-md
                            bg-white/[0.07]
                        "
                    />
                </div>
            </div>

            <div
                className="
                    absolute
                    inset-x-0
                    bottom-0
                    h-40
                    bg-linear-to-t
                    from-[#080a0d]
                    to-transparent
                "
            />
        </div>
    );
}

export function HomeSkeleton() {
    return (
        <main
            className="min-h-screen bg-[#080a0d]"
            aria-busy="true"
            aria-label="Cargando contenido de inicio"
        >
            <span className="sr-only">
                Cargando biblioteca...
            </span>

            <SkeletonHero />

            <div className="relative z-10 -mt-6 space-y-8 pb-16">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
            </div>
        </main>
    );
}