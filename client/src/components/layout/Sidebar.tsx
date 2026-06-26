import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlinePhotograph,
  HiOutlineMusicNote,
  HiOutlineLockClosed,
  HiOutlinePencilAlt,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/files', label: 'My Files', icon: HiOutlineFolder },
  { path: '/gallery', label: 'Gallery', icon: HiOutlinePhotograph },
  { path: '/music', label: 'Music', icon: HiOutlineMusicNote },
  { path: '/vault', label: 'Vault', icon: HiOutlineLockClosed },
  { path: '/notes', label: 'Notes', icon: HiOutlinePencilAlt },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col
        bg-surface-950/80 backdrop-blur-2xl border-r border-surface-800/50
        transition-all duration-300 ease-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-800/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">PS</span>
        </div>
        {!collapsed && (
          <span className="gradient-text font-bold text-lg tracking-tight whitespace-nowrap">
            Personal Storage
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'nav-item-active' : 'nav-item'
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-surface-800/50
                   text-surface-500 hover:text-white transition-colors"
      >
        {collapsed ? (
          <HiOutlineChevronRight className="w-5 h-5" />
        ) : (
          <HiOutlineChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
