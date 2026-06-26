import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { Track, MusicAlbum } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  currentAlbum: MusicAlbum | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  loopMode: 'NONE' | 'ALL' | 'ONE';
  shuffle: boolean;
}

interface PlayerContextType extends PlayerState {
  playTrack: (track: Track, album: MusicAlbum) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  closePlayer: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    currentAlbum: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.8,
    loopMode: 'NONE',
    shuffle: false,
  });

  const playTrack = useCallback((track: Track, album: MusicAlbum) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = track.r2Url;
    audio.volume = state.volume;
    audio.play().catch(console.error);

    setState((prev) => ({
      ...prev,
      currentTrack: track,
      currentAlbum: album,
      isPlaying: true,
      progress: 0,
    }));
  }, [state.volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [state.isPlaying, state.currentTrack]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setState((prev) => ({ ...prev, progress: time }));
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = vol;
    setState((prev) => ({ ...prev, volume: vol }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const toggleLoop = useCallback(() => {
    setState((prev) => {
      const modes: ('NONE' | 'ALL' | 'ONE')[] = ['NONE', 'ALL', 'ONE'];
      const nextIndex = (modes.indexOf(prev.loopMode) + 1) % modes.length;
      return { ...prev, loopMode: modes[nextIndex] };
    });
  }, []);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setState((prev) => ({
      ...prev,
      currentTrack: null,
      currentAlbum: null,
      isPlaying: false,
      progress: 0,
    }));
  }, []);

  const navigateTrack = useCallback((direction: 1 | -1) => {
    if (!state.currentAlbum || !state.currentTrack) return;
    const tracks = state.currentAlbum.tracks;
    if (tracks.length === 0) return;

    if (state.shuffle && direction === 1) {
      // Pick a random track that is not the current one, unless it's the only track
      if (tracks.length === 1) {
        seekTo(0);
        return;
      }
      let randomIndex = Math.floor(Math.random() * tracks.length);
      const currentIndex = tracks.findIndex((t) => t._id === state.currentTrack!._id);
      while (randomIndex === currentIndex) {
        randomIndex = Math.floor(Math.random() * tracks.length);
      }
      playTrack(tracks[randomIndex]!, state.currentAlbum);
      return;
    }

    const currentIndex = tracks.findIndex((t) => t._id === state.currentTrack!._id);
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0) {
      nextIndex = state.loopMode === 'ALL' ? tracks.length - 1 : 0;
    } else if (nextIndex >= tracks.length) {
      if (state.loopMode === 'ALL') {
        nextIndex = 0;
      } else {
        // Stop playing
        setState((prev) => ({ ...prev, isPlaying: false, progress: 0 }));
        return;
      }
    }
    
    playTrack(tracks[nextIndex]!, state.currentAlbum);
  }, [state.currentAlbum, state.currentTrack, state.shuffle, state.loopMode, playTrack, seekTo]);

  const handleTrackEnd = useCallback(() => {
    if (state.loopMode === 'ONE') {
      seekTo(0);
      const audio = audioRef.current;
      if (audio) audio.play().catch(console.error);
    } else {
      navigateTrack(1);
    }
  }, [state.loopMode, navigateTrack, seekTo]);

  const nextTrack = useCallback(() => navigateTrack(1), [navigateTrack]);
  const prevTrack = useCallback(() => navigateTrack(-1), [navigateTrack]);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playTrack,
        togglePlay,
        seekTo,
        setVolume,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleLoop,
        closePlayer,
        audioRef,
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (audio) {
            setState((prev) => ({ ...prev, progress: audio.currentTime, duration: audio.duration || 0 }));
          }
        }}
        onEnded={handleTrackEnd}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio) {
            setState((prev) => ({ ...prev, duration: audio.duration }));
          }
        }}
      />
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
