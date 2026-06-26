import React, { useEffect, useState, useCallback, useRef } from 'react';
import Header from '../components/layout/Header';
import { getNotes, createNote, updateNote, deleteNote } from '../api/notes.api';
import type { Note, PaginationMeta } from '../types';
import { formatDate } from '../utils/formatters';
import {
  HiOutlinePlus, HiOutlineTrash, HiOutlinePencilAlt, HiOutlineX,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

// ─── Floating Editor Component ───────────────────────────────────

interface FloatingEditorProps {
  note: Note | null;
  onSave: (title: string, content: string, tags: string[]) => Promise<void>;
  onClose: () => void;
}

const FloatingEditor: React.FC<FloatingEditorProps> = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  const editorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  // Drag state
  const [pos, setPos] = useState({ x: window.innerWidth / 2 - 280, y: 100 });
  const [size, setSize] = useState({ w: 560, h: 480 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const resizeRef = useRef({ resizing: false, startX: 0, startY: 0, startW: 0, startH: 0 });

  useEffect(() => {
    if (editorRef.current && note?.content) {
      editorRef.current.innerHTML = note.content;
    }
  }, [note]);

  // Drag handlers
  const onDragStart = (e: React.MouseEvent) => {
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, startPosX: pos.x, startPosY: pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current.dragging) {
        setPos({
          x: dragRef.current.startPosX + (e.clientX - dragRef.current.startX),
          y: dragRef.current.startPosY + (e.clientY - dragRef.current.startY),
        });
      }
      if (resizeRef.current.resizing) {
        setSize({
          w: Math.max(400, resizeRef.current.startW + (e.clientX - resizeRef.current.startX)),
          h: Math.max(350, resizeRef.current.startH + (e.clientY - resizeRef.current.startY)),
        });
      }
    };
    const onUp = () => { dragRef.current.dragging = false; resizeRef.current.resizing = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // Resize handler
  const onResizeStart = (e: React.MouseEvent) => {
    resizeRef.current = { resizing: true, startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h };
    e.preventDefault(); e.stopPropagation();
  };

  // Formatting commands
  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const content = editorRef.current?.innerHTML || '';
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      await onSave(title, content, tagArray);
      toast.success(note ? 'Note updated' : 'Note created');
      onClose();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div
      ref={panelRef}
      className="floating-panel z-50 flex flex-col animate-scale-in"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      {/* Title bar — draggable */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-surface-800/80 cursor-move select-none border-b border-surface-700/50"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-2">
          <HiOutlinePencilAlt className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-medium text-white">
            {note ? 'Edit Note' : 'New Note'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleSave} disabled={saving || !title.trim()} className="btn-primary !py-1.5 !px-3 !text-xs">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} className="text-surface-400 hover:text-white p-1">
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title input */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="px-4 py-2.5 bg-transparent text-white text-lg font-semibold border-b border-surface-800/50 focus:outline-none placeholder-surface-600"
        placeholder="Note title..."
      />

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-surface-800/50 bg-surface-900/30">
        <button onClick={() => execCmd('bold')} className="px-2 py-1 rounded text-xs font-bold text-surface-300 hover:bg-surface-700 hover:text-white transition-colors" title="Bold">
          B
        </button>
        <button onClick={() => execCmd('italic')} className="px-2 py-1 rounded text-xs italic text-surface-300 hover:bg-surface-700 hover:text-white transition-colors" title="Italic">
          I
        </button>
        <div className="w-px h-5 bg-surface-700 mx-1" />
        <button onClick={() => execCmd('fontSize', '2')} className="px-2 py-1 rounded text-xs text-surface-300 hover:bg-surface-700 hover:text-white transition-colors" title="Small text">
          A<span className="text-[10px]">-</span>
        </button>
        <button onClick={() => execCmd('fontSize', '4')} className="px-2 py-1 rounded text-sm text-surface-300 hover:bg-surface-700 hover:text-white transition-colors" title="Normal text">
          A
        </button>
        <button onClick={() => execCmd('fontSize', '6')} className="px-2 py-1 rounded text-base text-surface-300 hover:bg-surface-700 hover:text-white transition-colors" title="Large text">
          A<span className="text-[10px]">+</span>
        </button>
        <div className="w-px h-5 bg-surface-700 mx-1" />
        <button onClick={() => execCmd('insertUnorderedList')} className="px-2 py-1 rounded text-xs text-surface-300 hover:bg-surface-700 hover:text-white transition-colors" title="Bullet list">
          • List
        </button>
      </div>

      {/* Content editor */}
      <div
        ref={editorRef}
        contentEditable
        className="flex-1 px-4 py-3 text-sm text-surface-200 overflow-y-auto focus:outline-none leading-relaxed"
        style={{ minHeight: 0 }}
        data-placeholder="Start writing..."
        suppressContentEditableWarning
      />

      {/* Tags */}
      <div className="px-4 py-2 border-t border-surface-800/50">
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full bg-transparent text-xs text-surface-400 focus:outline-none placeholder-surface-600"
          placeholder="Tags (comma-separated)"
        />
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        onMouseDown={onResizeStart}
      >
        <svg className="w-3 h-3 text-surface-600 absolute bottom-1 right-1" viewBox="0 0 6 6">
          <circle cx="5" cy="1" r="0.7" fill="currentColor" />
          <circle cx="5" cy="3.5" r="0.7" fill="currentColor" />
          <circle cx="2.5" cy="3.5" r="0.7" fill="currentColor" />
          <circle cx="5" cy="5.8" r="0.7" fill="currentColor" />
          <circle cx="2.5" cy="5.8" r="0.7" fill="currentColor" />
          <circle cx="0" cy="5.8" r="0.7" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

// ─── Notes Page ──────────────────────────────────────────────────

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editorNote, setEditorNote] = useState<Note | null | 'new'>(null);

  const fetchNotes = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getNotes(p);
      setNotes(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotes(page); }, [page, fetchNotes]);

  const handleSave = async (title: string, content: string, tags: string[]) => {
    if (editorNote && editorNote !== 'new') {
      await updateNote(editorNote._id, { title, content, tags });
    } else {
      await createNote({ title, content, tags });
    }
    fetchNotes(page);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      toast.success('Note deleted');
      fetchNotes(page);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <Header title="Notes" />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-surface-400 text-sm">{pagination?.total || 0} notes</p>
          <button onClick={() => setEditorNote('new')} className="btn-primary">
            <HiOutlinePlus className="w-4 h-4 mr-2 inline" />New Note
          </button>
        </div>

        {/* Notes grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="glass-card p-5 h-40 animate-pulse"><div className="h-4 bg-surface-800 rounded w-2/3 mb-3" /><div className="h-3 bg-surface-800 rounded w-full mb-2" /><div className="h-3 bg-surface-800 rounded w-4/5" /></div>)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 text-surface-500">
            <HiOutlineDocumentText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No notes yet</p>
            <p className="text-sm mt-1">Click "New Note" to open the floating editor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="glass-card-hover p-5 cursor-pointer group"
                onClick={() => setEditorNote(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white truncate flex-1">{note.title}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
                <div
                  className="text-xs text-surface-400 line-clamp-4 mb-3 mask-gradient leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: note.content || '<em class="text-surface-600">Empty note</em>' }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge !text-[10px] !px-2 !py-0.5">{tag}</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-surface-600">{formatDate(note.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating editor */}
        {editorNote && (
          <FloatingEditor
            note={editorNote === 'new' ? null : editorNote}
            onSave={handleSave}
            onClose={() => setEditorNote(null)}
          />
        )}
      </div>
    </div>
  );
};

export default NotesPage;
