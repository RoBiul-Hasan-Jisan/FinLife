'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, X, CheckCircle2, Circle, Flame, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Habit { _id: string; title: string; description: string; color: string; icon: string; streak: number; longestStreak: number; completedDates: string[]; status: string; }

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [form, setForm] = useState({ title: '', description: '', icon: '✨', color: '#8b5cf6', frequency: 'daily' });
  const today = new Date().toDateString();

  useEffect(() => {
    api.get('/habits').then(r => setHabits(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isCompletedToday = (h: Habit) => h.completedDates.some(d => new Date(d).toDateString() === today);

  const toggle = async (h: Habit) => {
    try {
      const r = await api.post(`/habits/${h._id}/complete`);
      setHabits(prev => prev.map(x => x._id === h._id ? r.data : x));
    } catch { toast.error('Failed to update'); }
  };

  const save = async () => {
    try {
      if (editing) {
        const r = await api.put(`/habits/${editing._id}`, form);
        setHabits(prev => prev.map(h => h._id === editing._id ? r.data : h));
        toast.success('Updated!');
      } else {
        const r = await api.post('/habits', form);
        setHabits(prev => [r.data, ...prev]);
        toast.success('Habit created!');
      }
      setShowModal(false);
    } catch (err: any) { toast.error(err.message); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete habit?')) return;
    await api.delete(`/habits/${id}`);
    setHabits(prev => prev.filter(h => h._id !== id));
    toast.success('Deleted');
  };

  const openEdit = (h: Habit) => { setEditing(h); setForm({ title: h.title, description: h.description, icon: h.icon, color: h.color, frequency: 'daily' }); setShowModal(true); };
  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', icon: '✨', color: '#8b5cf6', frequency: 'daily' }); setShowModal(true); };

  const ICONS = ['✨','🏃','📚','💧','🧘','🎯','💪','🍎','😴','✍️','🎵','🌿'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium shadow-sm transition">
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
      ) : habits.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🌱</div>
          <p className="font-medium text-lg">No habits yet</p>
          <p className="text-sm mt-1">Build great habits one day at a time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.filter(h => h.status === 'active').map(h => {
            const done = isCompletedToday(h);
            return (
              <div key={h._id} className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 transition-all shadow-sm hover:shadow-md ${done ? 'border-green-400 dark:border-green-500' : 'border-gray-100 dark:border-gray-700'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{h.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{h.title}</h3>
                      {h.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{h.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(h)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={() => del(h._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-semibold">{h.streak} day streak</span>
                  </div>
                  <button onClick={() => toggle(h)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition ${done ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600'}`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    {done ? 'Done!' : 'Mark Done'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Habit' : 'New Habit'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setForm(p => ({...p, icon: ic}))}
                      className={`w-10 h-10 text-xl rounded-xl border-2 transition ${form.icon === ic ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Exercise daily..."
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Optional details..."
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <input type="color" value={form.color} onChange={e => setForm(p => ({...p, color: e.target.value}))} className="h-10 w-20 rounded-lg border border-gray-200 cursor-pointer"/>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition">{editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
