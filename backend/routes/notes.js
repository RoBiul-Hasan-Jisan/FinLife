const createCrudRouter = require('./crudFactory');
const { Note } = require('../models/index');
module.exports = createCrudRouter(Note, { defaultSort: { isPinned: -1, updatedAt: -1 } });
