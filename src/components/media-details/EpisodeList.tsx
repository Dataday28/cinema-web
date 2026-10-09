import type { Episode } from '../../types/media';

import { EpisodeCard } from './EpisodeCard';

interface EpisodeListProps {
    episodes: Episode[];
}

export function EpisodeList({
    episodes,
}: EpisodeListProps) {
    return (
        <div className="divide-y divide-white/10">
            {episodes.map((episode) => (
                <EpisodeCard
                    key={episode.id}
                    episode={episode}
                />
            ))}
        </div>
    );
}