'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, X, Pencil, Trash2, Pin, PinOff, Search, StickyNote } from 'lucide-react';
import { format } from 'date-fns';

interface Note { _id: string; title: string; content: string; color: string; tags: string[]; isPinned: boolean; isArchived: boolean; updatedAt: string; }

const NOTE_COLORS = [
  { value: '#fef9c3', label: 'Yellow' },
  { value: '#dbeafe', label: 'Blue' },
  { value: '#dcfce7', label: 'Green' },
  { value: '#fce7f3', label: 'Pink' },
  { value: '#ede9fe', label: 'Purple' },
  { value: '#ffedd5', label: 'Orange' },
  { value: '#f1f5f9', label: 'Gray' },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '', color: '#fef9c3', tags: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/notes').then(r => setNotes(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editing) {
        const r = await api.put(`/notes/${editing._id}`, payload);
        setNotes(prev => prev.map(n => n._id === editing._id ? r.data : n));
        toast.success('Note updated!');
      } else {
        const r = await api.post('/notes', payload);
        setNotes(prev => [r.data, ...prev]);
        toast.success('Note created!');
      }
      setShowModal(false);
    } catch (err: any) { toast.error(err.message); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete note?')) return;
    await api.delete(`/notes/${id}`);
    setNotes(prev => prev.filter(n => n._id !== id));
    toast.success('Deleted');
  };

  const togglePin = async (note: Note) => {
    const r = await api.put(`/notes/${note._id}`, { isPinned: !note.isPinned });
    setNotes(prev => prev.map(n => n._id === note._id ? r.data : n));
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setForm({ title: note.title, content: note.content, color: note.color, tags: note.tags.join(', ') });
    setShowModal(true);
  };
  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', color: '#fef9c3', tags: '' });
    setShowModal(true);
  };

  const filtered = notes.filter(n =>
    !n.isArchived &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
  );
  const pinned = filtered.filter(n => n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white"><StickyNote className="w-5 h-5" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{notes.filter(n => !n.isArchived).length} notes</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium shadow-sm transition">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📝</div>
          <p className="font-medium text-lg">No notes yet</p>
          <p className="text-sm mt-1">Capture your thoughts and ideas</p>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Pin className="w-3 h-3" /> Pinned
              </p>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                {pinned.map(note => <NoteCard key={note._id} note={note} onEdit={openEdit} onDelete={del} onPin={togglePin} />)}
              </div>
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Others</p>}
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                {unpinned.map(note => <NoteCard key={note._id} note={note} onEdit={openEdit} onDelete={del} onPin={togglePin} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Note title..."
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium" />
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your note here..." rows={6}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-none" />
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma separated): work, idea, todo"
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {NOTE_COLORS.map(c => (
                    <button key={c.value} onClick={() => setForm(p => ({ ...p, color: c.value }))}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${form.color === c.value ? 'border-gray-600 dark:border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition">{editing ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete, onPin }: { note: Note; onEdit: (n: Note) => void; onDelete: (id: string) => void; onPin: (n: Note) => void }) {
  return (
    <div className="break-inside-avoid mb-4 rounded-2xl p-4 border border-black/5 shadow-sm hover:shadow-md transition-shadow group"
      style={{ backgroundColor: note.color }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{note.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onPin(note)} className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-black/10 transition" title={note.isPinned ? 'Unpin' : 'Pin'}>
            {note.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onEdit(note)} className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-black/10 transition">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(note._id)} className="p-1 text-gray-500 hover:text-red-600 rounded-lg hover:bg-black/10 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {note.content && <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">{note.content}</p>}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-black/10 text-gray-700">#{tag}</span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-3">{format(new Date(note.updatedAt), 'MMM d, yyyy')}</p>
    </div>
  );
}
