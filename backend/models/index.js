const mongoose = require('mongoose');

// Savings Goal
const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true, min: 0 },
  currentAmount: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'USD' },
  deadline: { type: Date },
  category: { type: String, default: 'General' },
  color: { type: String, default: '#10b981' },
  icon: { type: String, default: '🎯' },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Investment
const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['stocks', 'crypto', 'bonds', 'real_estate', 'mutual_funds', 'etf', 'other'], default: 'other' },
  ticker: { type: String, default: '' },
  quantity: { type: Number, default: 0 },
  buyPrice: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  buyDate: { type: Date, default: Date.now },
  platform: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Subscription
const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'weekly', 'quarterly'], default: 'monthly' },
  nextBillingDate: { type: Date },
  category: { type: String, default: 'Entertainment' },
  status: { type: String, enum: ['active', 'cancelled', 'paused'], default: 'active' },
  icon: { type: String, default: '📦' },
  color: { type: String, default: '#f59e0b' },
  url: { type: String, default: '' },
}, { timestamps: true });

// Habit
const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  targetDays: [{ type: Number, min: 0, max: 6 }],
  color: { type: String, default: '#8b5cf6' },
  icon: { type: String, default: '✨' },
  completedDates: [{ type: Date }],
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });

// Task
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['todo', 'in_progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate: { type: Date },
  tags: [{ type: String }],
  category: { type: String, default: 'General' },
  reminder: { type: Date },
}, { timestamps: true });

// Note
const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  color: { type: String, default: '#fbbf24' },
  tags: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

// Settings
const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currency: { type: String, default: 'USD' },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  notifications: { type: Boolean, default: true },
  emailReports: { type: Boolean, default: false },
  weekStartsOn: { type: Number, enum: [0, 1], default: 1 },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  language: { type: String, default: 'en' },
}, { timestamps: true });

module.exports = {
  Goal: mongoose.model('Goal', goalSchema),
  Investment: mongoose.model('Investment', investmentSchema),
  Subscription: mongoose.model('Subscription', subscriptionSchema),
  Habit: mongoose.model('Habit', habitSchema),
  Task: mongoose.model('Task', taskSchema),
  Note: mongoose.model('Note', noteSchema),
  Settings: mongoose.model('Settings', settingsSchema),
};
