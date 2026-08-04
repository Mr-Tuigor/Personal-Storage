import React, { useEffect, useState, useCallback, useRef } from 'react';
import Header from '../components/layout/Header';
import { getImages, uploadImage, deleteImage, getImageAlbums, createImageAlbum, deleteImageAlbum, moveImage } from '../api/images.api';
import type { ImageItem, ImageAlbum, PaginationMeta } from '../types';
import { HiOutlineUpload, HiOutlineTrash, HiOutlinePlus, HiOutlineX, HiOutlinePhotograph, HiOutlineCollection } from 'react-icons/hi';
import toast from 'react-hot-toast';

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [albums, setAlbums] = useState<ImageAlbum[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [selectedAlbum, setSelectedAlbum] = useState<string | undefined>(undefined);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchAlbums = useCallback(async () => {
    try {
      const res = await getImageAlbums();
      if (res.data.data) setAlbums(res.data.data);
    } catch { console.error('Failed to load albums'); }
  }, []);

  const fetchImages = useCallback(async (p: number, album?: string) => {
    setLoading(true);
    try {
      const res = await getImages(p, 20, album);
      if (p === 1) { setImages(res.data.data); }
      else { setImages((prev) => [...prev, ...res.data.data]); }
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load images'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);
  useEffect(() => { setPage(1); setImages([]); fetchImages(1, selectedAlbum); }, [selectedAlbum, fetchImages]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && pagination?.hasNext && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchImages(nextPage, selectedAlbum);
      }
    }, { threshold: 0.1 });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [pagination, page, loading, selectedAlbum, fetchImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadImage(file, selectedAlbum);
      }
      toast.success(`${files.length} image(s) uploaded`);
      setPage(1); setImages([]);
      fetchImages(1, selectedAlbum);
      fetchAlbums();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    try {
      await createImageAlbum({ albumName: newAlbumName.trim() });
      toast.success('Album created');
      setNewAlbumName(''); setShowCreateAlbum(false);
      fetchAlbums();
    } catch { toast.error('Failed to create album'); }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Delete this album and all its images?')) return;
    try {
      await deleteImageAlbum(id);
      toast.success('Album deleted');
      if (selectedAlbum === id) setSelectedAlbum(undefined);
      fetchAlbums();
      setPage(1); setImages([]);
      fetchImages(1, undefined);
    } catch { toast.error('Failed to delete album'); }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await deleteImage(id);
      setImages((prev) => prev.filter((img) => img._id !== id));
      toast.success('Image deleted');
      fetchAlbums();
    } catch { toast.error('Failed to delete'); }
  };

  const handleMoveImage = async (id: string, newAlbumId: string | null) => {
    try {
      await moveImage(id, newAlbumId);
      toast.success('Image moved');
      setPage(1); setImages([]);
      fetchImages(1, selectedAlbum);
      fetchAlbums();
    } catch {
      toast.error('Failed to move image');
    }
  };

  return (
    <div>
      <Header title="Image Gallery" />
      <div className="p-8">
        {/* Albums bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setSelectedAlbum(undefined)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedAlbum ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'}`}
          >All</button>
          {albums.map((album) => (
            <div key={album._id} className="relative group">
              <button
                onClick={() => setSelectedAlbum(album._id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedAlbum === album._id ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-white'}`}
              >
                <HiOutlineCollection className="w-4 h-4 inline mr-1.5" />{album.albumName}
                <span className="ml-1.5 text-xs opacity-60">({album.imageCount})</span>
              </button>
              <button onClick={() => handleDeleteAlbum(album._id)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <HiOutlineX className="w-3 h-3" />
              </button>
            </div>
          ))}
          {showCreateAlbum ? (
            <div className="flex items-center gap-2">
              <input value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateAlbum()} className="input-field !py-2 !px-3 w-40" placeholder="Album name" autoFocus />
              <button onClick={handleCreateAlbum} className="btn-primary !py-2">Add</button>
              <button onClick={() => setShowCreateAlbum(false)} className="btn-ghost"><HiOutlineX className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setShowCreateAlbum(true)} className="btn-ghost text-brand-400">
              <HiOutlinePlus className="w-4 h-4 mr-1" />New Album
            </button>
          )}
        </div>

        {/* Upload */}
        <label className={`glass-card p-4 mb-6 flex items-center justify-center gap-3 cursor-pointer hover:border-brand-500/50 transition-all border-2 border-dashed border-surface-700 rounded-xl ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <HiOutlineUpload className="w-5 h-5 text-surface-400" />
          <span className="text-sm text-surface-400">{uploading ? 'Uploading...' : `Upload images${selectedAlbum ? ' to this album' : ''} (max 15 MB)`}</span>
          <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
        </label>

        {/* Image grid */}
        {images.length === 0 && !loading ? (
          <div className="text-center py-20 text-surface-500">
            <HiOutlinePhotograph className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No images yet</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {images.map((img) => (
              <div key={img._id} className="relative group break-inside-avoid rounded-xl overflow-hidden cursor-pointer animate-fade-in">
                <img
                  src={img.r2Url}
                  alt={img.originalName}
                  className="w-full rounded-xl object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onClick={() => setLightbox(img.r2Url)}
                />
                  <div className="absolute top-2 right-2 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <select 
                      className="bg-black/50 backdrop-blur-md text-xs text-white border-none outline-none cursor-pointer rounded px-1 py-0.5"
                      onChange={(e) => {
                        const val = e.target.value === "none" ? null : e.target.value;
                        handleMoveImage(img._id, val);
                        e.target.value = "";
                      }}
                      defaultValue=""
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="" disabled>Move...</option>
                      <option value="none">No Album</option>
                      {albums.filter(a => a._id !== img.albumId).map(a => (
                        <option key={a._id} value={a._id}>{a.albumName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none">
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between pointer-events-auto">
                      <span className="text-xs text-white/80 truncate">{img.originalName}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img._id); }} className="text-red-400 hover:text-red-300 p-1">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={observerRef} className="h-10" />
        {loading && <div className="text-center py-4 text-surface-500 text-sm">Loading...</div>}

        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(null)}>
            <button className="absolute top-6 right-6 text-white/60 hover:text-white"><HiOutlineX className="w-8 h-8" /></button>
            <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
