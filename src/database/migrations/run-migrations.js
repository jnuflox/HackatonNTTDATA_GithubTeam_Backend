const { sequelize } = require('../config/sequelize');

/**
 * Run database migrations
 * Creates all tables based on Sequelize models
 */
async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Sync all models (creates tables)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synchronized');

    console.log('✅ Migrations completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
