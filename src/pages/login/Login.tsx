import {
    useState,
    type FormEvent,
} from 'react';
import { useAuth } from '../../context/AuthContext';

export function Login() {

    const {
        login,
        isLoading,
    } = useAuth();

    const [username, setUsername] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [error, setError] =
        useState<string | null>(null);

    const handleSubmit = async (
        event: FormEvent
    ) => {

        event.preventDefault();

        setError(null);

        try {

            await login(
                username,
                password
            );

        } catch (error) {

            console.error(error);

            setError(
                'Usuario o contraseña incorrectos.'
            );

        }
    };

    return (
        <main
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-[#080a0d]
                px-4
                text-white
            "
        >

            <div className="w-full max-w-md">

                <h1
                    className="
                        mb-2
                        text-center
                        text-4xl
                        font-bold
                    "
                >
                    Iniciar sesión
                </h1>

                <p
                    className="
                        mb-8
                        text-center
                        text-gray-400
                    "
                >
                    Accede a tu biblioteca
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    <input
                        type="text"
                        value={username}
                        onChange={(event) =>
                            setUsername(
                                event.target.value
                            )
                        }
                        placeholder="Usuario"
                        autoComplete="username"
                        className="
                            w-full
                            rounded-md
                            border
                            border-white/10
                            bg-white/10
                            px-4
                            py-3
                            outline-none
                            transition
                            placeholder:text-gray-500
                            focus:border-white/30
                            focus:bg-white/15
                            "
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(
                                event.target.value
                            )
                        }
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        className="
                            w-full
                            rounded-md
                            border
                            border-white/10
                            bg-white/10
                            px-4
                            py-3
                            outline-none
                            transition
                            placeholder:text-gray-500
                            focus:border-white/30
                            focus:bg-white/15
                            "
                    />

                    {error && (
                        <p className="text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={
                            isLoading ||
                            !username
                        }
                        className="
                            w-full
                            rounded-md
                            bg-white
                            px-4
                            py-3
                            font-semibold
                            text-black
                            transition
                            hover:bg-gray-200
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            "
                    >
                        {isLoading
                            ? 'Iniciando sesión...'
                            : 'Iniciar sesión'}
                    </button>

                </form>

            </div>

        </main>
    );
}