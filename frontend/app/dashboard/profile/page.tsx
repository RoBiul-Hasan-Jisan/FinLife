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
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Profile Settings</h1>

      {/* Avatar card */}
      <div className="glass rounded-3xl p-8 border border-white/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10" />
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{profile?.name || 'User'}</h2>
            <p className="text-muted-foreground mt-1">{user?.email}</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Member since {user?.metadata?.creationTime ? format(new Date(user.metadata.creationTime), 'MMMM yyyy') : 'recently'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass rounded-3xl p-8 border border-white/20 space-y-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Personal Information
        </h3>

        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition" />
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name"
              className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-xl bg-white/50 dark:bg-white/5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={user?.email || ''}
              disabled
              className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-xl bg-white/30 dark:bg-white/5 text-muted-foreground cursor-not-allowed text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">Managed by Firebase and cannot be changed</p>
        </div>

        {/* Monthly Budget */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">Monthly Budget</label>
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition" />
            <input
              type="number"
              value={form.monthlyBudget}
              onChange={e => setForm(p => ({ ...p, monthlyBudget: Number(e.target.value) }))}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-xl bg-white/50 dark:bg-white/5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm"
            />
          </div>
          <p className="text-xs text-muted-foreground">Your total monthly spending target</p>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">Timezone</label>
          <select
            value={form.timezone}
            onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))}
            className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/50 dark:bg-white/5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm"
          >
            {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Dhaka', 'Australia/Sydney'].map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-primary to-accent hover:shadow-lg text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Account Security */}
      <div className="glass rounded-3xl p-8 border border-white/20 space-y-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-success" />
          Account Security
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 px-4 bg-white/50 dark:bg-white/5 rounded-lg">
            <span className="text-sm text-muted-foreground">Authentication Provider</span>
            <span className="text-sm font-semibold text-foreground">Firebase (Email/Password)</span>
          </div>
          
          <div className="flex items-center justify-between py-3 px-4 bg-white/50 dark:bg-white/5 rounded-lg">
            <span className="text-sm text-muted-foreground">Email Verified</span>
            <span className={`text-sm font-semibold flex items-center gap-1 ${user?.emailVerified ? 'text-success' : 'text-orange-500'}`}>
              {user?.emailVerified ? '✓ Verified' : '⚠ Not verified'}
            </span>
          </div>
          
          <div className="flex items-center justify-between py-3 px-4 bg-white/50 dark:bg-white/5 rounded-lg">
            <span className="text-sm text-muted-foreground">User ID</span>
            <span className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">{user?.uid}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
