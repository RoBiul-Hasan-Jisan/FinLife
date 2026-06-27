const createCrudRouter = require('./crudFactory');
const { Goal } = require('../models/index');
module.exports = createCrudRouter(Goal);
