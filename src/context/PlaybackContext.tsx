import {
    createContext,
    useContext,
    type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

interface PlaybackContextValue {
    play: (
        itemId: string
    ) => void;
    closePlayer: () => void;
}

const PlaybackContext = createContext<PlaybackContextValue | undefined>(undefined);

export function PlaybackProvider({children}: {children: ReactNode;}) {
    const navigate = useNavigate();

    const play = (
        itemId: string
    ) => {
        navigate(`/watch/${encodeURIComponent(itemId)}`);
    };

    const closePlayer = () => {
        navigate('/', { replace: true });
    };

    return (
        <PlaybackContext.Provider
            value={{
                play,
                closePlayer,
            }}
        >
            {children}
        </PlaybackContext.Provider>
    );
}

export function usePlayback() {

    const context =
        useContext(PlaybackContext);

    if (!context) {
        throw new Error(
            'usePlayback debe utilizarse dentro de PlaybackProvider'
        );
    }

    return context;
}