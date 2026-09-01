import { DataTypes } from 'sequelize';

export default function defineGoal(sequelize) {
  return sequelize.define(
    'Goal',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      current_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      target_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'accounts',
          key: 'id',
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'goals',
    },
  );
}
