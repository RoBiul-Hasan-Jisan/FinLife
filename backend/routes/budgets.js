const createCrudRouter = require('./crudFactory');
const Budget = require('../models/Budget');
module.exports = createCrudRouter(Budget);
