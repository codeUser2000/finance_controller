import { sequelize } from '../models/index.js';

async function migrate() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database tables created if they did not already exist.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
