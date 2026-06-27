const createCrudRouter = require('./crudFactory');
const { Subscription } = require('../models/index');
module.exports = createCrudRouter(Subscription);
