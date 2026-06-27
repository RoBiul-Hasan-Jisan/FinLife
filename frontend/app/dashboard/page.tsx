'use client';
import { useEffect, useState } from 'react';
import { useCurrency } from '@/lib/currency-context';
import api from '@/lib/api';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, CreditCard, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export default function DashboardPage() {
  const { format: fmt, symbol } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  const { summary = {}, charts = {}, recentTransactions = [], goals = [], portfolio = {}, subscriptions = {} } = data || {};

  const statCards = [
    { label: 'Monthly Income', value: fmt(summary.totalIncome || 0), icon: TrendingUp, color: 'text-success', bg: 'from-success/20 to-success/10', gradient: 'from-success to-success/80', trend: '+' },
    { label: 'Monthly Expenses', value: fmt(summary.totalExpenses || 0), icon: TrendingDown, color: 'text-destructive', bg: 'from-destructive/20 to-destructive/10', gradient: 'from-destructive to-destructive/80', trend: '-' },
    { label: 'Net Balance', value: fmt(summary.balance || 0), icon: Wallet, color: summary.balance >= 0 ? 'text-primary' : 'text-destructive', bg: summary.balance >= 0 ? 'from-primary/20 to-primary/10' : 'from-destructive/20 to-destructive/10', gradient: summary.balance >= 0 ? 'from-primary to-primary/80' : 'from-destructive to-destructive/80', trend: '' },
    { label: 'Savings Rate', value: `${summary.savingsRate || 0}%`, icon: PiggyBank, color: 'text-accent', bg: 'from-accent/20 to-accent/10', gradient: 'from-accent to-accent/80', trend: '' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{format(new Date(), 'MMMM yyyy')} overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map(({ label, value, icon: Icon, color, bg, gradient }) => (
          <div
            key={label}
            className="glass rounded-2xl p-6 border border-white/20 hover:border-white/30 group overflow-hidden transition-all hover:shadow-xl"
          >
            {/* Gradient bg accent */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${bg} rounded-full blur-2xl -z-10 group-hover:scale-110 transition-transform`} />

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/20 group">
          <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
            Income vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={charts.monthly || []}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${symbol}${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => fmt(v)} />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#income)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expense)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="glass rounded-2xl p-6 border border-white/20">
          <h3 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-accent to-primary rounded-full" />
            Spending by Category
          </h3>
          {charts.categories?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={charts.categories} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {charts.categories.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {charts.categories.slice(0, 4).map((cat: any, i: number) => (
                  <div key={cat._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400">{cat._id}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{fmt(cat.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-gray-400 text-sm text-center mt-12">No expenses this month</p>}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent transactions */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full" />
              Recent Transactions
            </h3>
            <Link href="/dashboard/expenses" className="text-sm text-primary hover:text-primary/80 font-medium transition">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentTransactions.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No transactions yet</p>}
            {recentTransactions.map((tx: any) => (
              <div key={tx._id} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'}`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-success" /> : <ArrowDownRight className="w-5 h-5 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">{tx.category} · {format(new Date(tx.date), 'MMM d')}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Goals + Portfolio */}
        <div className="space-y-6">
          {/* Goals */}
          <div className="glass rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Savings Goals
              </h3>
              <Link href="/dashboard/goals" className="text-xs text-primary hover:text-primary/80 font-medium">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {goals.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No goals yet</p>}
              {goals.map((g: any) => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g._id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">{g.icon} {g.title}</span>
                      <span className="text-xs font-semibold text-primary">{pct}%</span>
                    </div>
                    <div className="h-2 bg-white/50 dark:bg-white/5 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Portfolio */}
          <div className="glass rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                Portfolio
              </h3>
              <Link href="/dashboard/investments" className="text-xs text-primary hover:text-primary/80 font-medium">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{fmt(portfolio.value || 0)}</div>
              </div>
              <div className={`text-sm font-semibold flex items-center gap-1 ${portfolio.gainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                {portfolio.gainLoss >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {portfolio.gainLoss >= 0 ? '+' : ''}{fmt(portfolio.gainLoss || 0)} ({portfolio.gainLossPct || 0}%)
              </div>
              <div className="text-xs text-muted-foreground">{portfolio.holdings || 0} holdings</div>
            </div>
          </div>

          {/* Monthly subs */}
          <div className="glass rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                Subscriptions
              </h3>
              <Link href="/dashboard/subscriptions" className="text-xs text-primary hover:text-primary/80 font-medium">
                View all →
              </Link>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{fmt(subscriptions.monthly || 0)}<span className="text-sm text-muted-foreground font-normal">/month</span></div>
              <div className="text-sm text-muted-foreground mt-2">{subscriptions.count || 0} active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
