/**
 * Database Migration Script
 * Syncs all models with the database
 */

const { sequelize } = require('../models');
const logger = require('../utils/logger');

async function migrate() {
  try {
    logger.info('Starting database migration...');

    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync all models
    // alter: true will try to alter tables to match models
    // force: true will drop tables and recreate (USE WITH CAUTION!)
    const options = {
      alter: process.env.DB_ALTER === 'true',
      force: process.env.DB_FORCE === 'true',
    };

    if (options.force) {
      logger.warn('⚠️  WARNING: Running migration with force=true will DROP ALL TABLES!');
      logger.warn('⚠️  This will DELETE ALL DATA in the database!');
      
      // Wait 5 seconds to allow cancellation
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    await sequelize.sync(options);

    logger.info('✅ Database migration completed successfully');
    logger.info('All models have been synced with the database');

    // Display created tables
    const tables = await sequelize.getQueryInterface().showAllTables();
    logger.info(`Created/Updated tables: ${tables.join(', ')}`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Database migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();

