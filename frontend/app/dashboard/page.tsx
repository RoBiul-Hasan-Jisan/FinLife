'use client';
import { useEffect, useState } from 'react';
import { useCurrency } from '@/lib/currency-context';
import api from '@/lib/api';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    { label: 'Monthly Income', value: fmt(summary.totalIncome || 0), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', trend: '+' },
    { label: 'Monthly Expenses', value: fmt(summary.totalExpenses || 0), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', trend: '-' },
    { label: 'Net Balance', value: fmt(summary.balance || 0), icon: Wallet, color: summary.balance >= 0 ? 'text-indigo-600' : 'text-red-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', trend: '' },
    { label: 'Savings Rate', value: `${summary.savingsRate || 0}%`, icon: PiggyBank, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', trend: '' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{format(new Date(), 'MMMM yyyy')} overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
              <div className={`p-2 rounded-xl ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses</h3>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
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
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <Link href="/dashboard/expenses" className="text-xs text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No transactions yet</p>}
            {recentTransactions.map((tx: any) => (
              <div key={tx._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.title}</p>
                    <p className="text-xs text-gray-500">{tx.category} · {format(new Date(tx.date), 'MMM d')}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Goals + Portfolio */}
        <div className="space-y-4">
          {/* Goals */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Savings Goals</h3>
              <Link href="/dashboard/goals" className="text-xs text-indigo-600">View all</Link>
            </div>
            <div className="space-y-3">
              {goals.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No goals yet</p>}
              {goals.map((g: any) => {
                const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                return (
                  <div key={g._id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{g.icon} {g.title}</span>
                      <span className="text-gray-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: g.color || '#6366f1' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Portfolio */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Portfolio</h3>
              <Link href="/dashboard/investments" className="text-xs text-indigo-600">View all</Link>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(portfolio.value || 0)}</div>
            <div className={`text-xs mt-1 ${portfolio.gainLoss >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {portfolio.gainLoss >= 0 ? '+' : ''}{fmt(portfolio.gainLoss || 0)} ({portfolio.gainLossPct || 0}%)
            </div>
            <div className="text-xs text-gray-500 mt-1">{portfolio.holdings || 0} holdings</div>
          </div>

          {/* Monthly subs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Subscriptions</h3>
              <Link href="/dashboard/subscriptions" className="text-xs text-indigo-600">View all</Link>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(subscriptions.monthly || 0)}<span className="text-sm text-gray-400 font-normal">/mo</span></div>
            <div className="text-xs text-gray-500 mt-1">{subscriptions.count || 0} active subscriptions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
