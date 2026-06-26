import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-surface-800/50 bg-surface-950/50 backdrop-blur-xl sticky top-0 z-30">
      <h1 className="text-xl font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <HiOutlineUser className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-surface-300 hidden sm:block">
            {user?.username}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="btn-ghost text-surface-400 hover:text-red-400"
          title="Logout"
        >
          <HiOutlineLogout className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
