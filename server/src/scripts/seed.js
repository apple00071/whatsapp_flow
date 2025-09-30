/**
 * Database Seed Script
 * Seeds the database with initial data
 */

const { User, Session, Contact, ApiKey } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@whatsapp-api.com' },
      defaults: {
        email: 'admin@whatsapp-api.com',
        password: adminPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        email_verified: true,
        is_active: true,
      },
    });

    if (adminCreated) {
      logger.info('✅ Admin user created');
      logger.info('   Email: admin@whatsapp-api.com');
      logger.info('   Password: Admin@123');
      logger.info('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
    } else {
      logger.info('ℹ️  Admin user already exists');
    }

    // Create test user
    const testPassword = await bcrypt.hash('Test@123', 10);
    const [testUser, testCreated] = await User.findOrCreate({
      where: { email: 'test@example.com' },
      defaults: {
        email: 'test@example.com',
        password: testPassword,
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
        email_verified: true,
        is_active: true,
      },
    });

    if (testCreated) {
      logger.info('✅ Test user created');
      logger.info('   Email: test@example.com');
      logger.info('   Password: Test@123');
    } else {
      logger.info('ℹ️  Test user already exists');
    }

    // Create developer user
    const devPassword = await bcrypt.hash('Dev@123', 10);
    const [devUser, devCreated] = await User.findOrCreate({
      where: { email: 'developer@example.com' },
      defaults: {
        email: 'developer@example.com',
        password: devPassword,
        first_name: 'Developer',
        last_name: 'User',
        role: 'developer',
        email_verified: true,
        is_active: true,
      },
    });

    if (devCreated) {
      logger.info('✅ Developer user created');
      logger.info('   Email: developer@example.com');
      logger.info('   Password: Dev@123');
    } else {
      logger.info('ℹ️  Developer user already exists');
    }

    // Create sample API key for test user
    if (testCreated) {
      const crypto = require('crypto');
      const apiKey = `sk_test_${crypto.randomBytes(32).toString('hex')}`;
      const keyHash = await bcrypt.hash(apiKey, 10);

      await ApiKey.create({
        user_id: testUser.id,
        name: 'Test API Key',
        key_hash: keyHash,
        key_prefix: apiKey.substring(0, 10),
        scopes: [
          'messages:read',
          'messages:write',
          'sessions:read',
          'sessions:write',
          'contacts:read',
          'contacts:write',
          'groups:read',
          'groups:write',
          'webhooks:read',
          'webhooks:write',
        ],
        is_active: true,
      });

      logger.info('✅ Sample API key created for test user');
      logger.info(`   API Key: ${apiKey}`);
      logger.info('   ⚠️  Save this key - it will not be shown again!');
    }

    logger.info('✅ Database seeding completed successfully');
    logger.info('');
    logger.info('=== IMPORTANT ===');
    logger.info('Please change all default passwords immediately!');
    logger.info('Default credentials are for development only.');
    logger.info('================');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seed();

