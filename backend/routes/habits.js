const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Habit } = require('../models/index');

router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: habits, total: habits.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const habit = await Habit.create({ ...req.body, userId: req.user._id });
    res.status(201).json(habit);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body, { new: true }
    );
    if (!habit) return res.status(404).json({ error: 'Not found' });
    res.json(habit);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Toggle completion for today
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ error: 'Not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alreadyDone = habit.completedDates.some(d => new Date(d).toDateString() === today.toDateString());

    if (alreadyDone) {
      habit.completedDates = habit.completedDates.filter(d => new Date(d).toDateString() !== today.toDateString());
    } else {
      habit.completedDates.push(today);
    }

    // Calculate streak
    let streak = 0;
    const sortedDates = [...habit.completedDates].sort((a, b) => new Date(b) - new Date(a));
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    for (const date of sortedDates) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      if (d.toDateString() === checkDate.toDateString()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }
    habit.streak = streak;
    habit.longestStreak = Math.max(habit.longestStreak, streak);
    await habit.save();
    res.json(habit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
