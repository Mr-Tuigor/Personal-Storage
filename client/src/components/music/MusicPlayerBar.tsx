import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { formatDuration } from '../../utils/formatters';
import {
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineRewind,
  HiOutlineFastForward,
  HiOutlineVolumeUp,
  HiOutlineX,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi';
import { BiShuffle, BiRepeat } from 'react-icons/bi';

const MusicPlayerBar: React.FC = () => {
  const {
    currentTrack,
    currentAlbum,
    isPlaying,
    progress,
    duration,
    volume,
    loopMode,
    shuffle,
    togglePlay,
    seekTo,
    setVolume,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleLoop,
    closePlayer,
  } = usePlayer();

  const [isMinimized, setIsMinimized] = React.useState(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="player-bar">
      {/* Progress bar */}
      <div className="relative h-1 bg-surface-800 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percent = x / rect.width;
          seekTo(percent * duration);
        }}
      >
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-100"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      <div className={`transition-all duration-300 ease-in-out ${isMinimized ? 'h-0 opacity-0 overflow-hidden' : 'h-16 opacity-100'}`}>
        <div className="flex items-center justify-between px-6 h-full">
          {/* Track info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg relative group overflow-hidden">
              <HiOutlineVolumeUp className="w-5 h-5 text-white z-10" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentTrack.trackName}</p>
              <p className="text-xs text-surface-400 truncate">
                {currentAlbum?.albumName} — {currentAlbum?.artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={toggleShuffle} className={`transition-colors ${shuffle ? 'text-brand-400' : 'text-surface-400 hover:text-white'}`}>
              <BiShuffle className="w-5 h-5" />
            </button>
            <button onClick={prevTrack} className="text-surface-400 hover:text-white transition-colors">
              <HiOutlineRewind className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-surface-900 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
            >
              {isPlaying ? <HiOutlinePause className="w-5 h-5" /> : <HiOutlinePlay className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={nextTrack} className="text-surface-400 hover:text-white transition-colors">
              <HiOutlineFastForward className="w-5 h-5" />
            </button>
            <button onClick={toggleLoop} className={`transition-colors relative ${loopMode !== 'NONE' ? 'text-brand-400' : 'text-surface-400 hover:text-white'}`}>
              <BiRepeat className="w-5 h-5" />
              {loopMode === 'ONE' && <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-brand-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">1</span>}
            </button>
          </div>

          {/* Time + Volume */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <span className="text-xs text-surface-500 tabular-nums">
              {formatDuration(progress)} / {formatDuration(duration || 0)}
            </span>
            <div className="flex items-center gap-2 group/volume">
              <HiOutlineVolumeUp className="w-4 h-4 text-surface-500 group-hover/volume:text-surface-400 transition-colors" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 accent-brand-500 opacity-70 group-hover/volume:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Minimize/Close Bar (Always visible) */}
      <div className="absolute top-0 right-0 -translate-y-full flex items-center gap-1 bg-surface-900 border-x border-t border-surface-800 rounded-t-lg px-2 py-1 shadow-lg">
        {isMinimized && (
           <div className="mr-2 flex items-center gap-2 max-w-xs">
              <span className="text-xs text-brand-400 truncate font-medium flex-1">{currentTrack.trackName}</span>
              <button onClick={togglePlay} className="text-white hover:text-brand-400">
                {isPlaying ? <HiOutlinePause className="w-4 h-4" /> : <HiOutlinePlay className="w-4 h-4" />}
              </button>
           </div>
        )}
        <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 text-surface-400 hover:text-white rounded hover:bg-surface-800 transition-colors">
          {isMinimized ? <HiOutlineChevronUp className="w-4 h-4" /> : <HiOutlineChevronDown className="w-4 h-4" />}
        </button>
        <button onClick={closePlayer} className="p-1 text-surface-400 hover:text-red-400 rounded hover:bg-surface-800 transition-colors">
          <HiOutlineX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayerBar;
