import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import defineCategory from './Category.js';
import defineAccount from './Account.js';
import defineBudgetItem from './BudgetItem.js';
import defineTransaction from './Transaction.js';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  },
);

export const Category = defineCategory(sequelize);
export const Account = defineAccount(sequelize);
export const BudgetItem = defineBudgetItem(sequelize);
export const Transaction = defineTransaction(sequelize);

Category.hasMany(BudgetItem, {
  foreignKey: 'category_id',
  as: 'budgetItems',
});

BudgetItem.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'Category',
});

Category.hasMany(Transaction, {
  foreignKey: 'category_id',
  as: 'transactions',
});

Transaction.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'Category',
});

Account.hasMany(Transaction, {
  foreignKey: 'account_id',
  as: 'transactions',
});

Transaction.belongsTo(Account, {
  foreignKey: 'account_id',
  as: 'Account',
});
