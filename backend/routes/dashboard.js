const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { Goal, Subscription, Investment } = require('../models/index');

router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Current month totals
    const [monthExpenses, monthIncome, recentExpenses, recentIncome, goals, subscriptions, investments] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Expense.find({ userId }).sort({ date: -1 }).limit(5),
      Income.find({ userId }).sort({ date: -1 }).limit(5),
      Goal.find({ userId, status: 'active' }),
      Subscription.find({ userId, status: 'active' }),
      Investment.find({ userId }),
    ]);

    const totalExpenses = monthExpenses[0]?.total || 0;
    const totalIncome = monthIncome[0]?.total || 0;

    // Monthly breakdown for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [monthlyExpenses, monthlyIncome] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Income.aggregate([
        { $match: { userId, date: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
    ]);

    // Category breakdown this month
    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    // Investment portfolio value
    const portfolioValue = investments.reduce((sum, inv) => sum + (inv.currentPrice || inv.buyPrice) * inv.quantity, 0);
    const portfolioCost = investments.reduce((sum, inv) => sum + inv.buyPrice * inv.quantity, 0);

    // Monthly subscriptions cost
    const monthlySubCost = subscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === 'monthly') return sum + sub.amount;
      if (sub.billingCycle === 'yearly') return sum + sub.amount / 12;
      if (sub.billingCycle === 'weekly') return sum + sub.amount * 4.33;
      return sum;
    }, 0);

    const recentTransactions = [
      ...recentExpenses.map(e => ({ ...e.toObject(), type: 'expense' })),
      ...recentIncome.map(i => ({ ...i.toObject(), type: 'income' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0,
      },
      charts: {
        monthly: buildMonthlyChart(monthlyExpenses, monthlyIncome),
        categories: categoryBreakdown,
      },
      recentTransactions,
      goals: goals.slice(0, 3),
      portfolio: {
        value: portfolioValue,
        cost: portfolioCost,
        gainLoss: portfolioValue - portfolioCost,
        gainLossPct: portfolioCost > 0 ? ((portfolioValue - portfolioCost) / portfolioCost * 100).toFixed(2) : 0,
        holdings: investments.length,
      },
      subscriptions: {
        monthly: monthlySubCost,
        count: subscriptions.length,
        active: subscriptions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function buildMonthlyChart(expenses, income) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      monthNum: d.getMonth() + 1,
      expenses: 0,
      income: 0,
    });
  }
  expenses.forEach(e => {
    const m = months.find(m => m.monthNum === e._id.month && m.year === e._id.year);
    if (m) m.expenses = e.total;
  });
  income.forEach(i => {
    const m = months.find(m => m.monthNum === i._id.month && m.year === i._id.year);
    if (m) m.income = i.total;
  });
  return months;
}

module.exports = router;
