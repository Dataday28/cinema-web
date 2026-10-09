import { Outlet } from 'react-router-dom';
import { MediaDetails } from '../media-details/MediaDetails';
import Navbar from '../navigation/Navbar';

export function AppLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-black text-white">
            <Navbar />
            <Outlet />
            <MediaDetails />
        </div>
    );
}
