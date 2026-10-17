import {
    Navigate,
    Outlet,
    Route,
    Routes,
    useParams,
} from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { usePlayback } from '../context/PlaybackContext';
import { Home } from '../pages/home/Home';
import { Login } from '../pages/login/Login';
import { Watch } from '../pages/watch/Watch';
import { Movies } from '../pages/movies/Movies';
import { Series } from '../pages/series/Series';
import Settings from '../pages/settings/Settings';

function RequireAuthentication() {
    const { isAuthenticated } = useAuth();

    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/login" replace />;
}

function RedirectAuthenticatedUsers() {
    const { isAuthenticated } = useAuth();

    return isAuthenticated
        ? <Navigate to="/" replace />
        : <Outlet />;
}

function WatchRoute() {
    const { itemId } = useParams();
    const { closePlayer } = usePlayback();

    return itemId
        ? <Watch itemId={itemId} onClose={closePlayer} />
        : <Navigate to="/" replace />;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<RedirectAuthenticatedUsers />}>
                <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<RequireAuthentication />}>
                <Route element={<AppLayout />}>
                    <Route path="/peliculas" element={<Movies />} />
                </Route>
            </Route>

            <Route element={<RequireAuthentication />}>
                <Route element={<AppLayout />}>
                    <Route path="/series" element={<Series />} />
                </Route>
            </Route>

            <Route element={<RequireAuthentication />}>
                <Route element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path="watch/:itemId" element={<WatchRoute />} />
                </Route>
            </Route>

            <Route element={<RequireAuthentication />}>
                <Route element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
