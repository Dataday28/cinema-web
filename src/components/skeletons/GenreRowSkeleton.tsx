interface GenreRowSkeletonProps {
    count?: number;
}

export function GenreRowSkeleton({
    count = 6,
}: GenreRowSkeletonProps) {
    return (
        <section
            aria-hidden="true"
            className="animate-pulse space-y-4"
        >
            <div className="mx-4 h-6 w-44 rounded bg-white/10 sm:mx-8" />

            <div className="flex gap-3 overflow-hidden px-4 sm:px-8">
                {Array.from({ length: count }, (_, index) => (
                    <div
                        key={index}
                        className="
                            aspect-2/3
                            w-36
                            shrink-0
                            rounded-md
                            bg-white/10
                            sm:w-44
                            lg:w-48
                        "
                    />
                ))}
            </div>
        </section>
    );
}