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
    await addColumnIfMissing('budget_items', 'is_active', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await addColumnIfMissing('goals', 'user_id', userIdColumn);
    await addColumnIfMissing('goals', 'account_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
    });
    await addColumnIfMissing('transactions', 'to_account_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
    });
    await addColumnIfMissing('users', 'totp_secret', {
      type: DataTypes.STRING(64),
      allowNull: true,
    });
    await addColumnIfMissing('users', 'totp_enabled', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    console.log('Database tables created if they did not already exist.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
