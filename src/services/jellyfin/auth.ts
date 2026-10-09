import {
    getAuthenticationApi,
} from '@jellyfin/sdk/lib/utils/api/authentication-api';
import { createJellyfinApi } from './client';

export interface JellyfinSession {
    accessToken: string;
    userId: string;
    username: string;
}

export async function login(
    username: string,
    password: string
): Promise<JellyfinSession> {

    const api = createJellyfinApi();

    const authApi =
        getAuthenticationApi(api);

    const response =
        await authApi.authenticateUserByName({
            authenticateUserByName: {
                Username: username,
                Pw: password,
            },
        });

    const result = response.data;

    if (
        !result.AccessToken ||
        !result.User?.Id
    ) {
        throw new Error(
            'Jellyfin no devolvió una sesión válida'
        );
    }

    return {
        accessToken: result.AccessToken,
        userId: result.User.Id,
        username:
            result.User.Name ?? username,
    };
}