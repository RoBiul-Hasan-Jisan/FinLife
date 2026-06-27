'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, X, Pencil, Trash2, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Task { _id: string; title: string; description: string; status: string; priority: string; dueDate?: string; category: string; }

const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  todo: { label: 'To Do', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  done: { label: 'Done', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
};
const PRIORITY_CONFIG: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600', urgent: 'bg-red-100 text-red-600',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', category: 'General' });

  useEffect(() => {
    api.get('/tasks').then(r => setTasks(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      if (editing) {
        const r = await api.put(`/tasks/${editing._id}`, form);
        setTasks(prev => prev.map(t => t._id === editing._id ? r.data : t));
        toast.success('Updated!');
      } else {
        const r = await api.post('/tasks', form);
        setTasks(prev => [r.data, ...prev]);
        toast.success('Task created!');
      }
      setShowModal(false);
    } catch (err: any) { toast.error(err.message); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
    toast.success('Deleted');
  };

  const changeStatus = async (task: Task, status: string) => {
    const r = await api.put(`/tasks/${task._id}`, { ...task, status });
    setTasks(prev => prev.map(t => t._id === task._id ? r.data : t));
  };

  const openEdit = (t: Task) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description, status: t.status, priority: t.priority, dueDate: t.dueDate ? format(new Date(t.dueDate), 'yyyy-MM-dd') : '', category: t.category });
    setShowModal(true);
  };
  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', category: 'General' }); setShowModal(true); };

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tasks.filter(t => t.status !== 'done').length} pending tasks</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition">
          <Plus className="w-4 h-4"/> New Task
        </button>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map(status => {
          const cfg = STATUS_CONFIG[status];
          const statusTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} className="space-y-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cfg.bg}`}>
                <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white dark:bg-gray-800 ${cfg.color} font-medium`}>{statusTasks.length}</span>
              </div>
              <div className="space-y-2">
                {statusTasks.map(task => (
                  <div key={task._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(task)} className="p-1 text-gray-400 hover:text-indigo-600 rounded transition"><Pencil className="w-3 h-3"/></button>
                        <button onClick={() => del(task._id)} className="p-1 text-gray-400 hover:text-red-600 rounded transition"><Trash2 className="w-3 h-3"/></button>
                      </div>
                    </div>
                    {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_CONFIG[task.priority]}`}>{task.priority}</span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3"/>{format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {/* Status move buttons */}
                    <div className="flex gap-1 mt-3">
                      {STATUSES.filter(s => s !== status).map(s => (
                        <button key={s} onClick={() => changeStatus(task, s)}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition">
                          → {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {statusTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-300 dark:text-gray-600 text-sm border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: 'title', label: 'Title', type: 'text', placeholder: 'Task title...' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'category', label: 'Category', type: 'text', placeholder: 'Work, Personal...' },
                { key: 'dueDate', label: 'Due Date', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} rows={2} placeholder="Optional..."
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"/>
                  ) : (
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"/>
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition">{editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
