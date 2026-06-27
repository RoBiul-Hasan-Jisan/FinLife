const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  category: {
    type: String,
    enum: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Rental', 'Other'],
    default: 'Other'
  },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  isRecurring: { type: Boolean, default: false },
  recurringPeriod: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly', null], default: null },
}, { timestamps: true });

incomeSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
