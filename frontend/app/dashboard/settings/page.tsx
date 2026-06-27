'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/lib/currency-context';
import { CURRENCIES } from '@/lib/currency';
import { Settings, Palette, Globe, Bell, Save } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [settings, setSettings] = useState<any>({
    currency: 'USD', theme: 'system', notifications: true,
    emailReports: false, weekStartsOn: 1, dateFormat: 'MM/DD/YYYY',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => {
      setSettings(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      setCurrency(settings.currency);
      setTheme(settings.theme);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const set = (key: string, val: any) => setSettings((p: any) => ({ ...p, [key]: val }));

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-600 text-white"><Settings className="w-5 h-5" /></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Appearance */}
      <Section icon={<Palette className="w-4 h-4" />} title="Appearance">
        <Field label="Theme">
          <div className="flex gap-2">
            {['light', 'dark', 'system'].map(t => (
              <button key={t} onClick={() => set('theme', t)}
                className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium capitalize transition ${settings.theme === t ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Currency & Region */}
      <Section icon={<Globe className="w-4 h-4" />} title="Currency & Region">
        <Field label="Default Currency">
          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map(c => (
              <button key={c.code} onClick={() => set('currency', c.code)}
                className={`py-2 px-3 rounded-xl border-2 text-sm transition ${settings.currency === c.code ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 font-semibold' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Date Format">
          <select value={settings.dateFormat} onChange={e => set('dateFormat', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Week Starts On">
          <div className="flex gap-2">
            {[{ label: 'Monday', value: 1 }, { label: 'Sunday', value: 0 }].map(opt => (
              <button key={opt.value} onClick={() => set('weekStartsOn', opt.value)}
                className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition ${settings.weekStartsOn === opt.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell className="w-4 h-4" />} title="Notifications">
        <Toggle label="Push Notifications" desc="Get alerts for budget limits and reminders" value={settings.notifications} onChange={v => set('notifications', v)} />
        <Toggle label="Monthly Email Reports" desc="Receive monthly financial summaries via email" value={settings.emailReports} onChange={v => set('emailReports', v)} />
      </Section>

      {/* Save */}
      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg">
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="text-indigo-600">{icon}</div>
        <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
