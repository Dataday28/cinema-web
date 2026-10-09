import type { Season } from '../../types/media';

interface SeasonSelectorProps {
    seasons: Season[];
    selectedSeasonId: string | null;
    onChange: (
        seasonId: string
    ) => void;
}

export function SeasonSelector({
    seasons,
    selectedSeasonId,
    onChange,
}: SeasonSelectorProps) {

    return (
        <select
            value={
                selectedSeasonId ?? ''
            }
            onChange={(event) =>
                onChange(event.target.value)
            }
            className="
                rounded-md
                border border-gray-600
                bg-[#242424]
                px-4 py-2
                text-white
                outline-none
                transition
                focus:border-gray-400
            "
        >
            {seasons.map((season) => (
                <option
                    key={season.id}
                    value={season.id}
                >
                    {season.title}
                </option>
            ))}
        </select>
    );
}