const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  try {
    const { name, currency, theme, monthlyBudget, timezone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency, theme, monthlyBudget, timezone },
      { new: true, runValidators: true }
    ).select('-__v');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
