const createCrudRouter = require('./crudFactory');
const Income = require('../models/Income');
module.exports = createCrudRouter(Income, { defaultSort: { date: -1 } });
