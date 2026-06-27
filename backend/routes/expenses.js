// routes/expenses.js
const createCrudRouter = require('./crudFactory');
const Expense = require('../models/Expense');
module.exports = createCrudRouter(Expense, { defaultSort: { date: -1 } });
