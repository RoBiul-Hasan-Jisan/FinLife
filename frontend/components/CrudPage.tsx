'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Search, Loader } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">{title}</h1>
          <p className="text-muted-foreground text-sm">{items.length} {items.length === 1 ? 'record' : 'records'}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-xl text-white rounded-xl text-sm font-semibold shadow-lg transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          className="w-full pl-12 pr-4 py-3.5 border border-white/20 rounded-xl bg-white/50 dark:bg-white/5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-semibold text-foreground">No {title.toLowerCase()} yet</p>
            <p className="text-sm text-muted-foreground mt-1">Click "Add New" to create your first entry</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/50 dark:bg-white/5">
                <tr>
                  {columns.map(col => (
                    <th key={col.key} className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{col.label}</th>
                  ))}
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map(item => (
                  <tr key={item._id} className="hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
                    {columns.map(col => (
                      <td key={col.key} className="px-6 py-4 text-foreground">
                        {col.render ? col.render(item, fmt) : (
                          currencyFields.includes(col.key) ? fmt(item[col.key] || 0) :
                          col.key === 'date' || col.key === 'buyDate' || col.key === 'nextBillingDate' ? (item[col.key] ? format(new Date(item[col.key]), 'MMM d, yyyy') : '—') :
                          String(item[col.key] ?? '—')
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(item)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-foreground">{editing ? 'Edit' : 'Add'} {title.replace(/s$/, '')}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition p-1 hover:bg-white/50 dark:hover:bg-white/5 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-foreground mb-2">{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</label>
                  {field.type === 'select' ? (
                    <select
                      value={form[field.key] ?? ''}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/50 dark:bg-white/5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={form[field.key] ?? ''}
                      onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      rows={3}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/50 dark:bg-white/5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.key] ?? ''}
                      onChange={e => setForm(p => ({ ...p, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/50 dark:bg-white/5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-white/10 bg-white/25 dark:bg-white/5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-white/20 text-foreground rounded-xl text-sm font-semibold hover:bg-white/50 dark:hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
