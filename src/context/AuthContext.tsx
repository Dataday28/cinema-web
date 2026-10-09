import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';
import {
    login as jellyfinLogin,
    type JellyfinSession,
} from '../services/jellyfin/auth';

interface AuthContextValue {
    session: JellyfinSession | null;

    isAuthenticated: boolean;
    isLoading: boolean;

    login: (
        username: string,
        password: string
    ) => Promise<void>;

    logout: () => void;
}

const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined
    );

const SESSION_KEY = 'jellyfin-session';

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [session, setSession] =
        useState<JellyfinSession | null>(() => {

            const stored =
                localStorage.getItem(SESSION_KEY);

            if (!stored) {
                return null;
            }

            try {
                return JSON.parse(stored);
            } catch {
                localStorage.removeItem(
                    SESSION_KEY
                );

                return null;
            }
        });

    const [isLoading, setIsLoading] =
        useState(false);

    const login = async (
        username: string,
        password: string
    ) => {

        setIsLoading(true);

        try {

            const newSession =
                await jellyfinLogin(
                    username,
                    password
                );

            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify(newSession)
            );

            setSession(newSession);

        } finally {

            setIsLoading(false);

        }
    };

    const logout = () => {
        localStorage.removeItem(
            SESSION_KEY
        );

        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                session,

                isAuthenticated:
                    session !== null,

                isLoading,

                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {

    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth debe utilizarse dentro de AuthProvider'
        );
    }

    return context;
}