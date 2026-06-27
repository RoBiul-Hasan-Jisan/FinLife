const createCrudRouter = require('./crudFactory');
const { Task } = require('../models/index');
module.exports = createCrudRouter(Task, { defaultSort: { dueDate: 1 } });
