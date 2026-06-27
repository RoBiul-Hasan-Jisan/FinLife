'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useCurrency } from '@/lib/currency-context';
import { CURRENCIES } from '@/lib/currency';
import { useTheme } from 'next-themes';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, DollarSign, TrendingUp, PiggyBank, Target, BarChart3,
  CreditCard, CheckSquare, StickyNote, Settings, User, LogOut, Menu, X,
  Sun, Moon, ChevronDown, Bell, Wallet, Activity, ChevronRight, Home
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Expenses', href: '/dashboard/expenses', icon: DollarSign },
  { label: 'Income', href: '/dashboard/income', icon: TrendingUp },
  { label: 'Budgets', href: '/dashboard/budgets', icon: Wallet },
  { label: 'Goals', href: '/dashboard/goals', icon: Target },
  { label: 'Investments', href: '/dashboard/investments', icon: BarChart3 },
  { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
  { label: 'Habits', href: '/dashboard/habits', icon: Activity },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'Notes', href: '/dashboard/notes', icon: StickyNote },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout, loading } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    router.push('/auth/login');
  };

  const handleCurrencyChange = async (c: string) => {
    setCurrency(c);
    try { await api.put('/settings', { currency: c }); } catch {}
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-background">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 glass border-r border-white/20 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">FinLife</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-2">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                    active
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-primary border border-blue-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight className="w-4 h-4 opacity-60" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <Link
              href="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === '/dashboard/settings'
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-primary border border-blue-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === '/dashboard/profile'
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-primary border border-blue-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-20 glass border-b border-white/10 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-3">
            {/* Currency Switcher */}
            <select
              value={currency}
              onChange={e => handleCurrencyChange(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg bg-white/50 dark:bg-white/5 border border-white/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5 transition"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg text-foreground hover:bg-white/50 dark:hover:bg-white/5 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {profile?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl shadow-lg z-50 overflow-hidden border border-white/20">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-white/50 dark:hover:bg-white/5 transition border-b border-white/10"
                  >
                    <User className="w-4 h-4 text-primary" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-white/50 dark:hover:bg-white/5 transition border-b border-white/10"
                  >
                    <Settings className="w-4 h-4 text-primary" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-br from-background via-secondary to-background">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
