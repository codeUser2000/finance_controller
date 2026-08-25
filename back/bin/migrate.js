import { DataTypes } from 'sequelize';
import { sequelize } from '../models/index.js';

async function addColumnIfMissing(table, column, definition) {
  const queryInterface = sequelize.getQueryInterface();
  const description = await queryInterface.describeTable(table);
  if (!description[column]) {
    await queryInterface.addColumn(table, column, definition);
    console.log(`Added ${table}.${column}`);
  }
}

async function migrate() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const userIdColumn = {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    };

    await addColumnIfMissing('categories', 'user_id', userIdColumn);
    await addColumnIfMissing('accounts', 'user_id', userIdColumn);
    await addColumnIfMissing('transactions', 'user_id', userIdColumn);

    console.log('Database tables created if they did not already exist.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
