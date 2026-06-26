import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/layout/Header';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  getDocumentFolders,
  createDocumentFolder,
  deleteDocumentFolder,
} from '../api/documents.api';
import type { Document, DocumentFolder, PaginationMeta } from '../types';
import { formatFileSize, formatDate, getFileIcon } from '../utils/formatters';
import {
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFolder,
  HiOutlineFolderAdd,
  HiX,
  HiOutlineEye,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const FilesPage: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Modal state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewingDoc, setViewingDoc] = useState<{ doc: Document, url: string } | null>(null);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await getDocumentFolders();
      setFolders(res.data.data || []);
    } catch {
      toast.error('Failed to load folders');
    }
  }, []);

  const fetchDocs = useCallback(async (p: number, fId?: string) => {
    setLoading(true);
    try {
      const res = await getDocuments(p, 20, fId);
      setDocs(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Load docs on page or folder change
  useEffect(() => {
    fetchDocs(page, selectedFolderId);
  }, [page, selectedFolderId, fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadDocument(file, selectedFolderId);
      }
      toast.success(`${files.length} file(s) uploaded`);
      fetchDocs(1, selectedFolderId);
      fetchFolders();
      setPage(1);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const res = await downloadDocument(doc._id);
      if (res.data.data?.url) {
        window.open(res.data.data.url, '_blank');
      }
    } catch {
      toast.error('Download failed');
    }
  };

  const handleView = async (doc: Document) => {
    try {
      const res = await downloadDocument(doc._id);
      if (res.data.data?.url) {
        setViewingDoc({ doc, url: res.data.data.url });
      }
    } catch {
      toast.error('Failed to load file preview');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file permanently?')) return;
    try {
      await deleteDocument(id);
      toast.success('File deleted');
      fetchDocs(page, selectedFolderId);
      fetchFolders();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const res = await createDocumentFolder({ folderName: newFolderName });
      toast.success('Folder created');
      setFolders([res.data.data!, ...folders]);
      setNewFolderName('');
      setShowFolderModal(false);
      setSelectedFolderId(res.data.data!._id);
      setPage(1);
    } catch {
      toast.error('Failed to create folder');
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolderId) return;
    if (!confirm('Are you sure you want to delete this folder? All files inside it will be permanently deleted!')) return;
    try {
      await deleteDocumentFolder(selectedFolderId);
      toast.success('Folder deleted');
      setSelectedFolderId(undefined);
      setPage(1);
      fetchFolders();
    } catch {
      toast.error('Failed to delete folder');
    }
  };

  return (
    <div className="min-h-screen relative">
      <Header title="My Files" />
      <div className="p-8">

        {/* Folders Bar */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => { setSelectedFolderId(undefined); setPage(1); }}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
              !selectedFolderId ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white'
            }`}
          >
            <HiOutlineFolder className="w-5 h-5" />
            All Files
          </button>
          
          {folders.map(folder => (
            <button
              key={folder._id}
              onClick={() => { setSelectedFolderId(folder._id); setPage(1); }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                selectedFolderId === folder._id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white'
              }`}
            >
              <HiOutlineFolder className="w-5 h-5" />
              {folder.folderName}
              <span className="bg-surface-900/50 text-xs py-0.5 px-2 rounded-full ml-1">
                {folder.fileCount}
              </span>
            </button>
          ))}
          
          <button
            onClick={() => setShowFolderModal(true)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800/50 text-brand-400 hover:bg-surface-700 hover:text-brand-300 transition-all duration-300 font-medium border border-brand-500/20"
          >
            <HiOutlineFolderAdd className="w-5 h-5" />
            New Folder
          </button>
        </div>

        {/* Folder Header & Upload Area */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="flex-1 glass-card p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {selectedFolderId ? folders.find(f => f._id === selectedFolderId)?.folderName : 'All Files'}
              </h2>
              <p className="text-sm text-surface-400">
                {selectedFolderId ? 'Files in this folder' : 'Your unorganized files and all folder contents'}
              </p>
            </div>
            {selectedFolderId && (
              <button onClick={handleDeleteFolder} className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-400/10">
                <HiOutlineTrash className="w-5 h-5 mr-2" />
                Delete Folder
              </button>
            )}
          </div>

          <label className={`w-full sm:w-1/3 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-surface-600 rounded-xl cursor-pointer
            hover:border-brand-500/50 hover:bg-brand-500/5 transition-all duration-300
            ${uploading ? 'opacity-50 pointer-events-none' : 'glass-card'}`}>
            <HiOutlineUpload className="w-8 h-8 text-surface-400" />
            <span className="text-sm text-surface-400 text-center">{uploading ? 'Uploading...' : 'Upload files here'}</span>
            <input type="file" multiple onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* File list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-surface-800 rounded-lg" />
                <div className="flex-1"><div className="h-4 bg-surface-800 rounded w-1/3 mb-2" /><div className="h-3 bg-surface-800 rounded w-1/5" /></div>
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-20 text-surface-500 glass-card">
            <HiOutlineFolder className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No files here yet</p>
            <p className="text-sm mt-2 opacity-60">Upload some files to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc._id} className="glass-card-hover p-4 flex items-center gap-4">
                <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleView(doc)}>
                  <p className="text-sm font-medium text-white truncate hover:text-brand-400 transition-colors">{doc.originalName}</p>
                  <p className="text-xs text-surface-500">{formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleView(doc)} className="btn-ghost" title="View">
                    <HiOutlineEye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDownload(doc)} className="btn-ghost" title="Download">
                    <HiOutlineDownload className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(doc._id)} className="btn-ghost text-red-400 hover:text-red-300" title="Delete">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev} className="btn-secondary disabled:opacity-30">
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-surface-400">Page {pagination.page} of {pagination.totalPages}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNext} className="btn-secondary disabled:opacity-30">
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Folder</h3>
              <button onClick={() => setShowFolderModal(false)} className="text-surface-400 hover:text-white transition-colors">
                <HiX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateFolder}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Folder Name</label>
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Invoices 2026"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowFolderModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={!newFolderName.trim()}>
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-5xl max-h-[90vh] flex flex-col glass-card border-surface-700 overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-surface-700 bg-surface-900/50">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(viewingDoc.doc.fileType)}</span>
                  {viewingDoc.doc.originalName}
                </h3>
                <p className="text-xs text-surface-400 mt-1">
                  {formatFileSize(viewingDoc.doc.fileSize)} • {viewingDoc.doc.fileType}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(viewingDoc.doc)} className="btn-secondary">
                  <HiOutlineDownload className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button onClick={() => setViewingDoc(null)} className="p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors">
                  <HiX className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-black/40 flex items-center justify-center min-h-[50vh]">
              {viewingDoc.doc.fileType.startsWith('image/') ? (
                <img src={viewingDoc.url} alt={viewingDoc.doc.originalName} className="max-w-full max-h-[70vh] object-contain rounded" />
              ) : viewingDoc.doc.fileType.startsWith('video/') ? (
                <video src={viewingDoc.url} controls className="max-w-full max-h-[70vh] rounded outline-none" />
              ) : viewingDoc.doc.fileType.startsWith('audio/') ? (
                <audio src={viewingDoc.url} controls className="w-full max-w-md outline-none" />
              ) : viewingDoc.doc.fileType === 'application/pdf' || viewingDoc.doc.fileType.startsWith('text/') ? (
                <iframe src={viewingDoc.url} className="w-full h-[70vh] rounded bg-white" title={viewingDoc.doc.originalName} />
              ) : (
                <div className="text-center">
                  <HiOutlineFolder className="w-16 h-16 mx-auto mb-4 text-surface-500" />
                  <p className="text-surface-300">No preview available for this file type.</p>
                  <p className="text-sm text-surface-500 mt-2">Please download the file to view it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;
