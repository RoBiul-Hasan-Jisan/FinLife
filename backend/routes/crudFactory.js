const express = require('express');
const auth = require('../middleware/auth');

/**
 * Creates a standard CRUD router for a given Mongoose model
 */
function createCrudRouter(Model, options = {}) {
  const router = express.Router();
  const { defaultSort = { createdAt: -1 }, populate = [] } = options;

  // GET all (with pagination)
  router.get('/', auth, async (req, res) => {
    try {
      const { page = 1, limit = 50, sort, ...filters } = req.query;
      const query = { userId: req.user._id, ...filters };

      // Remove undefined values
      Object.keys(query).forEach(k => query[k] === undefined && delete query[k]);

      let q = Model.find(query)
        .sort(sort ? JSON.parse(sort) : defaultSort)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      populate.forEach(p => q.populate(p));

      const [data, total] = await Promise.all([q, Model.countDocuments(query)]);
      res.json({ data, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET single
  router.get('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findOne({ _id: req.params.id, userId: req.user._id });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post('/', auth, async (req, res) => {
    try {
      const item = await Model.create({ ...req.body, userId: req.user._id });
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // PUT update
  router.put('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
      );
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
