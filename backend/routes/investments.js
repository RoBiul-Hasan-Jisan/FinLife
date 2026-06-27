const createCrudRouter = require('./crudFactory');
const { Investment } = require('../models/index');
module.exports = createCrudRouter(Investment);
