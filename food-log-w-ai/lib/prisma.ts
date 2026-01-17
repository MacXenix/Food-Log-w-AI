import 'dotenv/config'
import { Pool, PoolConfig } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../app/generated/prisma'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('💡 Please create a .env file with DATABASE_URL=postgresql://user:password@host:port/database');
  throw new Error('DATABASE_URL environment variable is required');
}

// Validate connection string format
if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
  console.error('❌ Invalid DATABASE_URL format. Must start with postgresql:// or postgres://');
  throw new Error('Invalid DATABASE_URL format');
}

// Enhanced pool configuration for better connection handling
const poolConfig: PoolConfig = {
  connectionString,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
  // Retry configuration
  allowExitOnIdle: false,
};

const pool = new Pool(poolConfig)
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({adapter})

// Handle connection errors
pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err);
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    stack: err.stack,
  });
});

// Handle connection events for debugging
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('acquire', () => {
  // Connection acquired from pool (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Database connection acquired from pool');
  }
});

// Test connection on startup
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0]);
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('💡 Check your DATABASE_URL and ensure the database is accessible');
    console.error('💡 Common issues:');
    console.error('   - Incorrect credentials');
    console.error('   - Database server not running');
    console.error('   - Network/firewall issues');
    console.error('   - SSL connection required (add ?sslmode=require to connection string)');
    // Don't throw here - let the app start and fail on first query if needed
  }
}

// Test connection in non-production or when explicitly requested
if (process.env.NODE_ENV !== 'production' || process.env.TEST_DB_CONNECTION === 'true') {
  testConnection().catch(() => {
    // Error already logged above
  });
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('🛑 Closing database connections...');
    await pool.end();
    await prisma.$disconnect();
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Closing database connections...');
    await pool.end();
    await prisma.$disconnect();
  });
}

export { prisma, pool };