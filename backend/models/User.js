const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, default: 'User' },
  photoURL: { type: String, default: '' },
  currency: { type: String, default: 'USD' },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  monthlyBudget: { type: Number, default: 0 },
  timezone: { type: String, default: 'UTC' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
