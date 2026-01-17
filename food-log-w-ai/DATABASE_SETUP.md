# Database Connection Setup Guide

## Quick Start

1. **Create a `.env` file** in the root directory with your database connection string:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

2. **Test your connection**:
   ```bash
   npm run test:db
   ```

3. **Run migrations** (if not already done):
   ```bash
   npx prisma migrate deploy
   # or for development:
   npx prisma migrate dev
   ```

## Connection String Format

### Standard PostgreSQL
```
postgresql://username:password@hostname:port/database
```

### Example (Local PostgreSQL)
```
postgresql://postgres:password@localhost:5432/food_log_db
```

### Example (Cloud Database - Supabase, Neon, etc.)
```
postgresql://user:password@host.provider.com:5432/database?sslmode=require
```

## Common Issues & Solutions

### ❌ "DATABASE_URL environment variable is not set"
- **Solution**: Create a `.env` file in the project root with your `DATABASE_URL`

### ❌ "Connection refused" or "ECONNREFUSED"
- **Check**: Database server is running
- **Check**: Host and port are correct
- **Check**: Firewall allows connections

### ❌ "Authentication failed"
- **Check**: Username and password are correct
- **Check**: User has proper permissions

### ❌ "Database does not exist"
- **Solution**: Create the database first:
  ```sql
  CREATE DATABASE your_database_name;
  ```

### ❌ "Table does not exist" (P42P01)
- **Solution**: Run migrations:
  ```bash
  npx prisma migrate deploy
  ```

### ❌ "SSL connection required"
- **Solution**: Add SSL parameter to connection string:
  ```
  postgresql://user:password@host:port/database?sslmode=require
  ```

### ❌ "Connection timeout"
- **Check**: Network connectivity
- **Check**: Database server is accessible
- **Check**: Firewall rules
- **Solution**: Increase timeout in connection string or pool config

## Testing Connection

### Method 1: Using the test script
```bash
npm run test:db
```

### Method 2: Using Prisma Studio
```bash
npx prisma studio
```

### Method 3: Using psql (PostgreSQL CLI)
```bash
psql "your_connection_string"
```

## Environment Variables

Make sure your `.env` file includes:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

**Note**: Never commit your `.env` file to version control!

## Connection Pool Settings

The connection pool is configured with:
- **Max connections**: 20
- **Idle timeout**: 30 seconds
- **Connection timeout**: 10 seconds

These can be adjusted in `lib/prisma.ts` if needed.

## Production Considerations

1. **Use connection pooling** (already configured)
2. **Use SSL** for remote databases:
   ```
   ?sslmode=require
   ```
3. **Set proper environment variables** in your hosting platform
4. **Monitor connection usage** to avoid hitting limits
5. **Use read replicas** for read-heavy workloads (if needed)

## Getting Help

If you're still having issues:
1. Run the test script: `npm run test:db`
2. Check the error messages in your terminal
3. Verify your database credentials
4. Ensure your database server is running and accessible
