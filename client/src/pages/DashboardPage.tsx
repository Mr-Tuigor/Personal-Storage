import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { getDashboardStats } from '../api/dashboard.api';
import type { DashboardStats } from '../types';
import {
  HiOutlineFolder,
  HiOutlinePhotograph,
  HiOutlineMusicNote,
  HiOutlinePencilAlt,
  HiOutlineLockClosed,
  HiOutlineCollection,
} from 'react-icons/hi';

const statCards = [
  { key: 'totalFiles', label: 'Files', route: '/files', icon: HiOutlineFolder, gradient: 'from-blue-500 to-cyan-400' },
  { key: 'totalImages', label: 'Images', route: '/gallery', icon: HiOutlinePhotograph, gradient: 'from-emerald-500 to-teal-400' },
  { key: 'totalAlbums', label: 'Photo Albums', route: '/gallery', icon: HiOutlineCollection, gradient: 'from-amber-500 to-orange-400' },
  { key: 'totalMusicAlbums', label: 'Music Albums', route: '/music', icon: HiOutlineMusicNote, gradient: 'from-pink-500 to-rose-400' },
  { key: 'totalNotes', label: 'Notes', route: '/notes', icon: HiOutlinePencilAlt, gradient: 'from-violet-500 to-purple-400' },
  { key: 'totalPasswords', label: 'Passwords', route: '/vault', icon: HiOutlineLockClosed, gradient: 'from-brand-500 to-indigo-400' },
] as const;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res.data.data) setStats(res.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Overview</h2>
        <p className="text-surface-400 mb-8">Your personal storage at a glance</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((card, i) => (
            <div
              key={card.key}
              onClick={() => navigate(card.route)}
              className="stat-card group cursor-pointer hover:border-brand-500/50 transition-colors"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center
                    shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                {loading ? (
                  <div className="w-12 h-8 bg-surface-800 rounded animate-pulse" />
                ) : (
                  <span className="text-3xl font-bold text-white tabular-nums">
                    {stats?.[card.key as keyof DashboardStats] ?? 0}
                  </span>
                )}
              </div>
              <span className="text-sm text-surface-400 font-medium">{card.label}</span>
            </div>
          ))}
        </div>

        {/* Quick tips */}
        <div className="mt-10 glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Quick Start</h3>
          <ul className="space-y-2 text-sm text-surface-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              Upload files, images, or music from their respective sections
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Store passwords securely in your encrypted vault
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
              Create notes with rich formatting using the floating editor
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
