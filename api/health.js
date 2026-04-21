/**
 * Database connection helper for Vercel Postgres
 * Provides a consistent interface for database operations
 */

import { sql } from '@vercel/postgres';

/**
 * Initialize the database schema
 * Creates the user_data table if it doesn't exist
 * @returns {Promise<boolean>} Success status
 */
export const initializeDatabase = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    // Create index on updated_at for potential cleanup jobs
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data(updated_at)
    `;
    
    console.log('✅ Database schema initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    return false;
  }
};

/**
 * Get user data by user ID
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUserData = async (userId) => {
  try {
    const { rows } = await sql`
      SELECT data, updated_at 
      FROM user_data 
      WHERE user_id = ${userId}
    `;
    
    if (rows.length === 0) {
      return null;
    }
    
    return {
      data: rows[0].data,
      updatedAt: rows[0].updated_at
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

/**
 * Save or update user data
 * @param {string} userId - The user's unique identifier
 * @param {Object} data - The data to save
 * @returns {Promise<Object>} Result with success status and timestamp
 */
export const saveUserData = async (userId, data) => {
  try {
    const result = await sql`
      INSERT INTO user_data (user_id, data, updated_at)
      VALUES (${userId}, ${JSON.stringify(data)}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET 
        data = EXCLUDED.data,
        updated_at = NOW()
      RETURNING updated_at
    `;
    
    return {
      success: true,
      updatedAt: result.rows[0]?.updated_at
    };
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

/**
 * Delete user data
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<boolean>} Success status
 */
export const deleteUserData = async (userId) => {
  try {
    await sql`
      DELETE FROM user_data 
      WHERE user_id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

/**
 * Get database statistics (useful for monitoring)
 * @returns {Promise<Object>} Database statistics
 */
export const getDatabaseStats = async () => {
  try {
    const { rows: userCount } = await sql`
      SELECT COUNT(*) as count FROM user_data
    `;
    
    const { rows: storageSize } = await sql`
      SELECT 
        pg_database_size(current_database()) as total_bytes,
        pg_size_pretty(pg_database_size(current_database())) as total_pretty,
        pg_table_size('user_data') as table_bytes,
        pg_size_pretty(pg_table_size('user_data')) as table_pretty
    `;
    
    return {
      userCount: parseInt(userCount[0]?.count || 0),
      storage: storageSize[0] || null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return {
      userCount: 0,
      storage: null,
      error: 'Failed to fetch stats'
    };
  }
};

/**
 * Clean up old/inactive user data (optional utility)
 * @param {number} daysOld - Delete data older than this many days
 * @returns {Promise<number>} Number of records deleted
 */
export const cleanupOldData = async (daysOld = 365) => {
  try {
    const { rowCount } = await sql`
      DELETE FROM user_data 
      WHERE updated_at < NOW() - INTERVAL '${daysOld} days'
    `;
    return rowCount;
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    throw error;
  }
};

/**
 * Check database connectivity
 * @returns {Promise<boolean>} True if database is reachable
 */
export const checkConnection = async () => {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

// Export the sql client for advanced queries
export { sql };