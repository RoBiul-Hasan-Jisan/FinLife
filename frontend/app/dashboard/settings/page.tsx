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

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Settings</h1>

      {/* Appearance */}
      <Section icon={<Palette className="w-5 h-5" />} title="Appearance">
        <Field label="Theme">
          <div className="flex gap-2">
            {['light', 'dark', 'system'].map(t => (
              <button
                key={t}
                onClick={() => set('theme', t)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium capitalize transition ${
                  settings.theme === t
                    ? 'border-primary bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-semibold'
                    : 'border-white/20 text-muted-foreground hover:border-white/40'
                }`}
              >
                {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Currency & Region */}
      <Section icon={<Globe className="w-5 h-5" />} title="Currency & Region">
        <Field label="Default Currency">
          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => set('currency', c.code)}
                className={`py-3 px-3 rounded-xl border-2 text-sm font-medium transition ${
                  settings.currency === c.code
                    ? 'border-primary bg-gradient-to-r from-primary/20 to-accent/20 text-primary'
                    : 'border-white/20 text-muted-foreground hover:border-white/40'
                }`}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Date Format">
          <select
            value={settings.dateFormat}
            onChange={e => set('dateFormat', e.target.value)}
            className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/50 dark:bg-white/5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm"
          >
            {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Week Starts On">
          <div className="flex gap-2">
            {[{ label: 'Monday', value: 1 }, { label: 'Sunday', value: 0 }].map(opt => (
              <button
                key={opt.value}
                onClick={() => set('weekStartsOn', opt.value)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition ${
                  settings.weekStartsOn === opt.value
                    ? 'border-primary bg-gradient-to-r from-primary/20 to-accent/20 text-primary'
                    : 'border-white/20 text-muted-foreground hover:border-white/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell className="w-5 h-5" />} title="Notifications">
        <Toggle
          label="Push Notifications"
          desc="Get alerts for budget limits and reminders"
          value={settings.notifications}
          onChange={v => set('notifications', v)}
        />
        <Toggle
          label="Monthly Email Reports"
          desc="Receive monthly financial summaries via email"
          value={settings.emailReports}
          onChange={v => set('emailReports', v)}
        />
      </Section>

      {/* Save Button */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-lg text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl border border-white/20 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10 bg-white/50 dark:bg-white/5">
        <div className="text-primary">{icon}</div>
        <h2 className="font-bold text-lg text-foreground">{title}</h2>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-3">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all flex-shrink-0 ${
          value
            ? 'bg-gradient-to-r from-primary to-accent'
            : 'bg-white/30 dark:bg-white/10'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
            value ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
