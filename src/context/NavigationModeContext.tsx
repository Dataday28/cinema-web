import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';

export type NavigationMode = 'mouse' | 'keyboard';

interface NavigationModeContextValue {
    mode: NavigationMode;
    setNavigationMode: (mode: NavigationMode) => void;
}

const NavigationModeContext =
    createContext<NavigationModeContextValue | null>(null);

export function NavigationModeProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [mode, setMode] = useState<NavigationMode>('mouse');

    const lastMousePosition = useRef<{
        x: number;
        y: number;
    } | null>(null);

    const setNavigationMode = (nextMode: NavigationMode) => {
        setMode(nextMode);
    };

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;

            const previous = lastMousePosition.current;

            lastMousePosition.current = {
                x: event.clientX,
                y: event.clientY,
            };

            if (!previous) return;

            const distance = Math.hypot(
                event.clientX - previous.x,
                event.clientY - previous.y
            );

            // Ignorar movimientos mínimos del cursor.
            if (distance < 3) return;

            setMode('mouse');
        };

        const handleKeyDown = (event: globalThis.KeyboardEvent) => {
            const navigationKeys = [
                'Tab',
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Enter',
                'Escape',
                ' ',
            ];

            if (navigationKeys.includes(event.key)) {
                setMode('keyboard');
            }
        };

        window.addEventListener('pointermove', handlePointerMove, {
            passive: true,
        });

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <NavigationModeContext.Provider
            value={{
                mode,
                setNavigationMode,
            }}
        >
            {children}
        </NavigationModeContext.Provider>
    );
}

export function useNavigationMode() {
    const context = useContext(NavigationModeContext);

    if (!context) {
        throw new Error(
            'useNavigationMode debe utilizarse dentro de NavigationModeProvider'
        );
    }

    return context;
}