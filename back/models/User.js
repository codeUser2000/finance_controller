import { DataTypes } from 'sequelize';

export default function defineUser(sequelize) {
  return sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      totp_secret: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      totp_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'users',
      defaultScope: {
        attributes: { exclude: ['password_hash'] },
      },
    },
  );
}
