import { DataTypes } from 'sequelize';

export default function defineCategory(sequelize) {
  return sequelize.define(
    'Category',
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
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('expense', 'income'),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'categories',
    },
  );
}
