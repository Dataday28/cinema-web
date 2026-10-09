import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';

import type { MediaItem } from '../types/media';

interface MediaDetailsContextValue {
    selectedItem: MediaItem | null;
    isOpen: boolean;

    openMediaDetails: (item: MediaItem) => void;
    closeMediaDetails: () => void;
}

const MediaDetailsContext =
    createContext<MediaDetailsContextValue | undefined>(
        undefined
    );

interface MediaDetailsProviderProps {
    children: ReactNode;
}

export function MediaDetailsProvider({
    children,
}: MediaDetailsProviderProps) {

    const [selectedItem, setSelectedItem] =
        useState<MediaItem | null>(null);

    const openMediaDetails = (item: MediaItem) => {
        setSelectedItem(item);
    };

    const closeMediaDetails = () => {
        setSelectedItem(null);
    };

    return (
        <MediaDetailsContext.Provider
            value={{
                selectedItem,
                isOpen: selectedItem !== null,
                openMediaDetails,
                closeMediaDetails,
            }}
        >
            {children}
        </MediaDetailsContext.Provider>
    );
}

export function useMediaDetails() {
    const context = useContext(MediaDetailsContext);

    if (!context) {
        throw new Error(
            'useMediaDetails debe utilizarse dentro de MediaDetailsProvider'
        );
    }

    return context;
}