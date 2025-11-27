import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { config } from '../config';
import { logger } from '../utils/logger';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

async function runSeeds() {
  try {
    logger.info('Running database seeds...');
    
    // First, hash the passwords
    const passwordHash = await bcrypt.hash('Password123!', 10);
    
    // Insert test users with real password hashes
    await pool.query(`
      INSERT INTO users (id, email, password_hash, phone, is_active, is_2fa_enabled)
      VALUES 
        (
          '00000000-0000-0000-0000-000000000001',
          'testuser@example.com',
          $1,
          '+1234567890',
          true,
          false
        ),
        (
          '00000000-0000-0000-0000-000000000002',
          'admin@example.com',
          $1,
          '+1234567891',
          true,
          false
        )
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash]);

    logger.info('Database seeding completed successfully');
    logger.info('Test credentials:');
    logger.info('  Email: testuser@example.com, Password: Password123!');
    logger.info('  Email: admin@example.com, Password: Password123!');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runSeeds };
