import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import defineUser from './User.js';
import defineCategory from './Category.js';
import defineAccount from './Account.js';
import defineBudgetItem from './BudgetItem.js';
import defineTransaction from './Transaction.js';
import defineGoal from './Goal.js';

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

export const User = defineUser(sequelize);
export const Category = defineCategory(sequelize);
export const Account = defineAccount(sequelize);
export const BudgetItem = defineBudgetItem(sequelize);
export const Transaction = defineTransaction(sequelize);
export const Goal = defineGoal(sequelize);

User.hasMany(Category, { foreignKey: 'user_id', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasMany(Account, { foreignKey: 'user_id', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

User.hasMany(Goal, { foreignKey: 'user_id', as: 'goals' });
Goal.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

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

Account.hasMany(Transaction, {
  foreignKey: 'to_account_id',
  as: 'incomingTransfers',
});

Transaction.belongsTo(Account, {
  foreignKey: 'to_account_id',
  as: 'ToAccount',
});

Account.hasMany(Goal, { foreignKey: 'account_id', as: 'goals' });
Goal.belongsTo(Account, { foreignKey: 'account_id', as: 'Account' });
