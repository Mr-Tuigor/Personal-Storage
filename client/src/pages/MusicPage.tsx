import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/layout/Header';
import { getMusicAlbums, createMusicAlbum, deleteMusicAlbum, uploadTrack, deleteTrack, moveTrack } from '../api/music.api';
import { usePlayer } from '../context/PlayerContext';
import type { MusicAlbum } from '../types';
import { formatDuration } from '../utils/formatters';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineUpload, HiOutlinePlay, HiOutlineMusicNote, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import toast from 'react-hot-toast';

const MusicPage: React.FC = () => {
  const [albums, setAlbums] = useState<MusicAlbum[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const { playTrack, currentTrack } = usePlayer();

  const fetchAlbums = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getMusicAlbums(p);
      setAlbums(res.data.data);
    } catch { toast.error('Failed to load albums'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAlbums(page); }, [page, fetchAlbums]);

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim() || !newArtist.trim()) return;
    try {
      await createMusicAlbum({ albumName: newAlbumName.trim(), artist: newArtist.trim() });
      toast.success('Album created');
      setNewAlbumName(''); setNewArtist(''); setShowCreateAlbum(false);
      fetchAlbums(1); setPage(1);
    } catch { toast.error('Failed to create album'); }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Delete this album and all its tracks?')) return;
    try {
      await deleteMusicAlbum(id);
      toast.success('Album deleted');
      fetchAlbums(page);
    } catch { toast.error('Failed to delete album'); }
  };

  const [uploadProgress, setUploadProgress] = useState<{ [albumId: string]: number }>({});

  const handleUploadTrack = async (albumId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadProgress((prev) => ({ ...prev, [albumId]: 0 }));
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const trackName = file.name.replace(/\.[^.]+$/, '');
        
        await uploadTrack(albumId, file, trackName, undefined, (progress) => {
          const baseProgress = (i / files.length) * 100;
          const currentProgress = (progress / files.length);
          setUploadProgress((prev) => ({ ...prev, [albumId]: Math.round(baseProgress + currentProgress) }));
        });
      }
      toast.success(files.length > 1 ? `${files.length} tracks uploaded` : 'Track uploaded');
      // Fetch albums in the background without causing a loading skeleton
      const res = await getMusicAlbums(page);
      setAlbums(res.data.data);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadProgress((prev) => {
        const next = { ...prev };
        delete next[albumId];
        return next;
      });
      e.target.value = '';
    }
  };

  const handleDeleteTrack = async (albumId: string, trackId: string) => {
    try {
      await deleteTrack(albumId, trackId);
      toast.success('Track deleted');
      fetchAlbums(page);
    } catch { toast.error('Failed to delete track'); }
  };

  const handleMoveTrack = async (albumId: string, trackId: string, newAlbumId: string) => {
    try {
      await moveTrack(albumId, trackId, newAlbumId);
      toast.success('Track moved');
      fetchAlbums(page);
    } catch {
      toast.error('Failed to move track');
    }
  };

  return (
    <div>
      <Header title="Music" />
      <div className="p-8">
        {/* Create album */}
        <div className="flex items-center gap-3 mb-6">
          {showCreateAlbum ? (
            <div className="glass-card p-4 flex flex-wrap items-center gap-3 w-full">
              <input value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} className="input-field !py-2 flex-1 min-w-[150px]" placeholder="Album name" />
              <input value={newArtist} onChange={(e) => setNewArtist(e.target.value)} className="input-field !py-2 flex-1 min-w-[150px]" placeholder="Artist" />
              <button onClick={handleCreateAlbum} className="btn-primary !py-2">Create</button>
              <button onClick={() => setShowCreateAlbum(false)} className="btn-ghost">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowCreateAlbum(true)} className="btn-primary">
              <HiOutlinePlus className="w-4 h-4 mr-2 inline" />New Album
            </button>
          )}
        </div>

        {/* Album list */}
        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card p-6 animate-pulse"><div className="h-5 bg-surface-800 rounded w-1/3 mb-2" /><div className="h-4 bg-surface-800 rounded w-1/5" /></div>)}</div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20 text-surface-500">
            <HiOutlineMusicNote className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No albums yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {albums.map((album) => (
              <div key={album._id} className="glass-card overflow-hidden animate-slide-up">
                {/* Album header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-surface-800/30 transition-colors"
                  onClick={() => setExpandedAlbum(expandedAlbum === album._id ? null : album._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <HiOutlineMusicNote className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{album.albumName}</h3>
                      <p className="text-sm text-surface-400">{album.artist} · {album.tracks.length} track{album.tracks.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album._id); }} className="btn-ghost text-red-400 hover:text-red-300" title="Delete album">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                    {expandedAlbum === album._id ? <HiOutlineChevronUp className="w-5 h-5 text-surface-500" /> : <HiOutlineChevronDown className="w-5 h-5 text-surface-500" />}
                  </div>
                </div>

                {/* Tracks */}
                {expandedAlbum === album._id && (
                  <div className="border-t border-surface-800/50 p-4 animate-fade-in">
                    {album.tracks.length === 0 ? (
                      <p className="text-sm text-surface-500 text-center py-4">No tracks yet</p>
                    ) : (
                      <div className="space-y-1 mb-4">
                        {album.tracks.map((track, idx) => (
                          <div
                            key={track._id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-800/50 transition-colors group
                              ${currentTrack?._id === track._id ? 'bg-brand-600/10 border border-brand-500/20' : ''}`}
                          >
                            <button
                              onClick={() => playTrack(track, album)}
                              className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center flex-shrink-0 opacity-80 hover:opacity-100 hover:scale-110 transition-all"
                            >
                              <HiOutlinePlay className="w-3.5 h-3.5 ml-0.5" />
                            </button>
                            <span className="text-xs text-surface-500 w-5">{idx + 1}</span>
                            <span className="flex-1 text-sm text-surface-200 truncate">{track.trackName}</span>
                            <span className="text-xs text-surface-500">{track.duration ? formatDuration(track.duration) : '--:--'}</span>
                            
                            <select 
                              className="bg-surface-800 text-xs text-surface-300 border-none outline-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded px-1"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleMoveTrack(album._id, track._id, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Move to...</option>
                              {albums.filter(a => a._id !== album._id).map(a => (
                                <option key={a._id} value={a._id}>{a.albumName}</option>
                              ))}
                            </select>

                            <button onClick={() => handleDeleteTrack(album._id, track._id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {typeof uploadProgress[album._id] === 'number' ? (
                      <div className="flex flex-col gap-2 p-3 border border-surface-700 rounded-lg bg-surface-800/50">
                        <div className="flex justify-between text-xs text-surface-400">
                          <span>Uploading track...</span>
                          <span>{uploadProgress[album._id]}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-500 transition-all duration-300 ease-out" 
                            style={{ width: `${uploadProgress[album._id]}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-surface-700 rounded-lg cursor-pointer hover:border-brand-500/50 transition-colors">
                        <HiOutlineUpload className="w-4 h-4 text-surface-400" />
                        <span className="text-sm text-surface-400">Add track</span>
                        <input type="file" multiple accept="audio/*" onChange={(e) => handleUploadTrack(album._id, e)} className="hidden" />
                      </label>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPage;
