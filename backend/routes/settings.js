const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Settings } = require('../models/index');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await Settings.create({ userId: req.user._id });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    // Sync currency/theme to user profile
    if (req.body.currency || req.body.theme) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(req.body.currency && { currency: req.body.currency }),
        ...(req.body.theme && { theme: req.body.theme }),
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
