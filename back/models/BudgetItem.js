import { DataTypes } from 'sequelize';

export default function defineBudgetItem(sequelize) {
  return sequelize.define(
    'BudgetItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
      },
      month: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'budget_items',
      indexes: [
        {
          unique: true,
          name: 'budget_items_category_month_year_unique',
          fields: ['category_id', 'month', 'year'],
        },
      ],
    },
  );
}
