import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { usePlayer } from '../../context/PlayerContext';

const DashboardLayout: React.FC = () => {
  const { currentTrack } = usePlayer();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Main content — offset by sidebar width, extra bottom padding when player is active */}
      <main
        className={`flex-1 ml-[72px] sm:ml-[260px] transition-all duration-300
          ${currentTrack ? 'pb-24' : ''}`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
