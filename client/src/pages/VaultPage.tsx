import React, { useEffect, useState, useCallback } from 'react';
import Header from '../components/layout/Header';
import { getPasswords, getPasswordById, createPassword, updatePassword, deletePassword } from '../api/passwords.api';
import type { PasswordEntry } from '../types';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff, HiOutlineClipboardCopy, HiOutlinePencil, HiOutlineLockClosed, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const VaultPage: React.FC = () => {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [page] = useState(1);
  const [loading, setLoading] = useState(true);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form fields
  const [formAccountName, setFormAccountName] = useState('');
  const [formAccountUsername, setFormAccountUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const fetchEntries = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getPasswords(p);
      setEntries(res.data.data);
    } catch { toast.error('Failed to load passwords'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEntries(page); }, [page, fetchEntries]);

  const handleReveal = async (id: string) => {
    if (revealedId === id) { setRevealedId(null); setRevealedPassword(''); return; }
    try {
      const res = await getPasswordById(id);
      if (res.data.data) {
        setRevealedId(id);
        setRevealedPassword(res.data.data.password);
      }
    } catch { toast.error('Failed to decrypt password'); }
  };

  const handleCopy = async (id: string) => {
    try {
      let pwd = revealedPassword;
      if (revealedId !== id) {
        const res = await getPasswordById(id);
        pwd = res.data.data?.password || '';
      }
      await navigator.clipboard.writeText(pwd);
      toast.success('Password copied to clipboard');
    } catch { toast.error('Failed to copy'); }
  };

  const resetForm = () => {
    setFormAccountName(''); setFormAccountUsername('');
    setFormPassword(''); setFormNotes('');
    setShowForm(false); setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePassword(editingId, {
          accountName: formAccountName,
          accountUsername: formAccountUsername,
          ...(formPassword && { password: formPassword }),
          notes: formNotes,
        });
        toast.success('Updated');
      } else {
        await createPassword({
          accountName: formAccountName,
          accountUsername: formAccountUsername,
          password: formPassword,
          notes: formNotes,
        });
        toast.success('Password saved to vault');
      }
      resetForm();
      fetchEntries(page);
    } catch { toast.error('Failed to save'); }
  };

  const handleEdit = async (entry: PasswordEntry) => {
    setFormAccountName(entry.accountName);
    setFormAccountUsername(entry.accountUsername);
    setFormPassword('');
    setFormNotes(entry.notes || '');
    setEditingId(entry._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vault entry?')) return;
    try {
      await deletePassword(id);
      toast.success('Deleted');
      fetchEntries(page);
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = searchQuery
    ? entries.filter((e) => e.accountName.toLowerCase().includes(searchQuery.toLowerCase()) || e.accountUsername.toLowerCase().includes(searchQuery.toLowerCase()))
    : entries;

  return (
    <div>
      <Header title="Password Vault" />
      <div className="p-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field max-w-xs" placeholder="Search vault..." />
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary ml-auto">
            <HiOutlinePlus className="w-4 h-4 mr-2 inline" />Add Password
          </button>
        </div>

        {/* Create/Edit modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={resetForm}>
            <div className="glass-card p-6 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{editingId ? 'Edit Entry' : 'New Vault Entry'}</h3>
                <button onClick={resetForm} className="text-surface-400 hover:text-white"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Account / Website</label>
                  <input value={formAccountName} onChange={(e) => setFormAccountName(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Username / Email</label>
                  <input value={formAccountUsername} onChange={(e) => setFormAccountUsername(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Password {editingId && '(leave blank to keep current)'}</label>
                  <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="input-field" {...(!editingId && { required: true })} />
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1 block">Notes (optional)</label>
                  <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} className="input-field resize-none" rows={2} />
                </div>
                <button type="submit" className="btn-primary w-full text-center">{editingId ? 'Update' : 'Save to Vault'}</button>
              </form>
            </div>
          </div>
        )}

        {/* Password list */}
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5 animate-pulse"><div className="h-4 bg-surface-800 rounded w-1/3 mb-2" /><div className="h-3 bg-surface-800 rounded w-1/4" /></div>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-surface-500">
            <HiOutlineLockClosed className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">{searchQuery ? 'No matches found' : 'Your vault is empty'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry) => (
              <div key={entry._id} className="glass-card-hover p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <HiOutlineLockClosed className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{entry.accountName}</h4>
                      <p className="text-xs text-surface-400">{entry.accountUsername}</p>
                      {revealedId === entry._id && (
                        <p className="text-xs text-brand-400 font-mono mt-1 animate-fade-in">{revealedPassword}</p>
                      )}
                      {entry.notes && <p className="text-xs text-surface-500 mt-1">{entry.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleReveal(entry._id)} className="btn-ghost" title={revealedId === entry._id ? 'Hide' : 'Reveal'}>
                      {revealedId === entry._id ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleCopy(entry._id)} className="btn-ghost" title="Copy password">
                      <HiOutlineClipboardCopy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(entry)} className="btn-ghost" title="Edit">
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(entry._id)} className="btn-ghost text-red-400" title="Delete">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultPage;
