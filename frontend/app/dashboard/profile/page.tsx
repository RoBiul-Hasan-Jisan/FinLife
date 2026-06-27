'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Mail, DollarSign, Save, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || '',
    monthlyBudget: profile?.monthlyBudget || 0,
    timezone: (profile as any)?.timezone || 'UTC',
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/users/me', form);
      await refreshProfile();
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-600 text-white"><User className="w-5 h-5" /></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
      </div>

      {/* Avatar card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
            <p className="text-white/80 text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-2 text-white/70 text-xs">
              <Calendar className="w-3 h-3" />
              Member since {user?.metadata?.creationTime ? format(new Date(user.metadata.creationTime), 'MMMM yyyy') : 'recently'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
        <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your full name"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={user?.email || ''} disabled
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Email is managed by Firebase and cannot be changed here.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Budget</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="number" value={form.monthlyBudget} onChange={e => setForm(p => ({ ...p, monthlyBudget: Number(e.target.value) }))} placeholder="0.00"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Your total monthly spending target.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
          <select value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Dhaka', 'Australia/Sydney'].map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition shadow-md">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Account info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Account Security</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Authentication Provider</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Firebase (Email/Password)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
            <span className={`text-sm font-medium ${user?.emailVerified ? 'text-green-600' : 'text-orange-500'}`}>
              {user?.emailVerified ? '✓ Verified' : '⚠ Not verified'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">User ID</span>
            <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{user?.uid}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
