'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { useCurrency } from '@/lib/currency-context';
import { format } from 'date-fns';

interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface CrudPageProps {
  title: string;
  endpoint: string;
  fields: Field[];
  columns: { key: string; label: string; render?: (row: any, fmt: (n: number) => string) => React.ReactNode }[];
  currencyFields?: string[];
  defaultValues?: Record<string, any>;
  icon?: React.ReactNode;
  color?: string;
}

export default function CrudPage({ title, endpoint, fields, columns, currencyFields = [], defaultValues = {}, icon, color = 'indigo' }: CrudPageProps) {
  const { format: fmt } = useCurrency();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>(defaultValues);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`/${endpoint}`);
      setItems(r.data.data || r.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [endpoint]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditing(null); setForm(defaultValues); setShowModal(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    const f: Record<string, any> = {};
    fields.forEach(field => { f[field.key] = field.type === 'date' && item[field.key] ? format(new Date(item[field.key]), 'yyyy-MM-dd') : (item[field.key] ?? defaultValues[field.key] ?? ''); });
    setForm(f);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        const r = await api.put(`/${endpoint}/${editing._id}`, form);
        setItems(prev => prev.map(i => i._id === editing._id ? r.data : i));
        toast.success('Updated!');
      } else {
        const r = await api.post(`/${endpoint}`, form);
        setItems(prev => [r.data, ...prev]);
        toast.success('Created!');
      }
      setShowModal(false);
    } catch (err: any) { toast.error(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/${endpoint}/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filtered = items.filter(item =>
    columns.some(col => String(item[col.key] || '').toLowerCase().includes(search.toLowerCase()))
  );

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    rose: 'bg-rose-600 hover:bg-rose-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className={`p-2 rounded-xl ${colorMap[color]} text-white`}>{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{items.length} records</p>
          </div>
        </div>
        <button onClick={openCreate} className={`flex items-center gap-2 px-4 py-2 ${colorMap[color]} text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition`}>
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-medium">No {title.toLowerCase()} yet</p>
            <p className="text-sm mt-1">Click "Add New" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {columns.map(col => (
                    <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{col.label}</th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {col.render ? col.render(item, fmt) : (
                          currencyFields.includes(col.key) ? fmt(item[col.key] || 0) :
                          col.key === 'date' || col.key === 'buyDate' || col.key === 'nextBillingDate' ? (item[col.key] ? format(new Date(item[col.key]), 'MMM d, yyyy') : '—') :
                          String(item[col.key] ?? '—')
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editing ? 'Edit' : 'New'} {title.replace(/s$/, '')}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}{field.required && ' *'}</label>
                  {field.type === 'select' ? (
                    <select value={form[field.key] ?? ''} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                      <option value="">Select {field.label}</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea value={form[field.key] ?? ''} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))} rows={3} placeholder={field.placeholder}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
                  ) : (
                    <input type={field.type} value={form[field.key] ?? ''} onChange={e => setForm(p => ({ ...p, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      placeholder={field.placeholder} required={field.required}
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className={`flex-1 py-2.5 ${colorMap[color]} text-white rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-50`}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
