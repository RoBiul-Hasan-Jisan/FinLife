const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  period: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' },
  month: { type: Number, min: 1, max: 12 },
  year: { type: Number },
  color: { type: String, default: '#6366f1' },
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
