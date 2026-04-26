import { sql } from '@vercel/postgres';

export const DEFAULT_SHELF_DATA = {
  calendarEvents: [],
  tasks: [],
  locations: [],
  trips: [],
  recipes: [],
  watchlist: [],
  profile: { users: [] }
};

export const DEFAULT_SHELF_SECTIONS = ['calendar', 'tasks', 'locations', 'trips', 'recipes', 'watchlist'];

const asArray = (value) => Array.isArray(value) ? value : [];

const getRelationKind = async (relationName) => {
  const result = await sql`
    SELECT c.relkind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = ${relationName}
    LIMIT 1
  `;

  return result.rows[0]?.relkind || null;
};

export const normalizeShelfSections = (sections) => {
  const allowed = new Set(DEFAULT_SHELF_SECTIONS);
  const normalized = asArray(sections).filter((section) => allowed.has(section));
  return normalized.length ? Array.from(new Set(normalized)) : [...DEFAULT_SHELF_SECTIONS];
};

const normalizeMediaCategory = (item = {}, fallbackCategory = '') => {
  const category = String(item.category || fallbackCategory || '').toLowerCase();
  const type = String(item.type || '').toLowerCase();

  if (category === 'books' || type === 'book') return 'books';
  if (category === 'movies' || type === 'movie') return 'movies';
  return 'tvshows';
};

const normalizeWatchlistStatus = (item = {}, category) => {
  const status = item.status;
  if (category === 'books') {
    if (status === 'toRead' || status === 'plan-to-read') return 'plan-to-read';
    if (status === 'reading') return 'reading';
    if (status === 'read' || status === 'completed') return 'read';
    return 'plan-to-read';
  }

  if (status === 'toWatch' || status === 'plan-to-watch') return 'plan-to-watch';
  if (status === 'watching') return 'watching';
  if (status === 'watched' || status === 'completed' || status === 'read') return 'completed';
  return 'plan-to-watch';
};

const normalizeWatchlistItem = (item, fallbackCategory) => {
  const category = normalizeMediaCategory(item, fallbackCategory);
  const typeByCategory = {
    movies: 'Movie',
    tvshows: 'Tv Show',
    books: 'Book'
  };

  return {
    ...item,
    category,
    type: typeByCategory[category],
    status: normalizeWatchlistStatus(item, category)
  };
};

export const normalizeShelfData = (data = {}) => {
  const raw = data && typeof data === 'object' ? data : {};
  const watchlistByKey = new Map();
  const addWatchlistItems = (items, fallbackCategory) => {
    asArray(items).forEach((item) => {
      if (!item || typeof item !== 'object') return;
      const normalized = normalizeWatchlistItem(item, fallbackCategory);
      const key = `${normalized.category}:${normalized.id || normalized.title || watchlistByKey.size}`;
      watchlistByKey.set(key, normalized);
    });
  };

  addWatchlistItems(raw.watchlist, '');
  addWatchlistItems(raw.movies, 'movies');
  addWatchlistItems(raw.tvshows, 'tvshows');
  addWatchlistItems(raw.anime, 'tvshows');
  addWatchlistItems(raw.books, 'books');

  return {
    calendarEvents: asArray(raw.calendarEvents),
    tasks: asArray(raw.tasks),
    locations: asArray(raw.locations).length ? asArray(raw.locations) : asArray(raw.dates),
    trips: asArray(raw.trips),
    recipes: asArray(raw.recipes),
    watchlist: Array.from(watchlistByKey.values()),
    profile: raw.profile && typeof raw.profile === 'object' ? raw.profile : DEFAULT_SHELF_DATA.profile
  };
};

export const initializeDatabase = async () => {
  try {
    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        display_name TEXT NOT NULL,
        username TEXT,
        google_id TEXT UNIQUE,
        apple_id TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username TEXT
    `;

    await sql`
      WITH ranked_users AS (
        SELECT
          id,
          COALESCE(NULLIF(username, ''), display_name) AS base_username,
          ROW_NUMBER() OVER (
            PARTITION BY LOWER(COALESCE(NULLIF(username, ''), display_name))
            ORDER BY created_at, id
          ) AS duplicate_rank
        FROM users
      )
      UPDATE users
      SET username = CASE
        WHEN ranked_users.duplicate_rank = 1 THEN ranked_users.base_username
        ELSE ranked_users.base_username || '-' || LEFT(users.id, 6)
      END
      FROM ranked_users
      WHERE users.id = ranked_users.id
        AND (
          users.username IS NULL
          OR users.username = ''
          OR ranked_users.duplicate_rank > 1
        )
    `;

    const shelvesRelationKind = await getRelationKind('shelves');
    const shelfIdRelationKind = await getRelationKind('shelf_id');

    if (shelvesRelationKind === 'r' && !shelfIdRelationKind) {
      await sql`ALTER TABLE shelves RENAME TO shelf_id`;
    }

    // Shelf metadata table
    await sql`
      CREATE TABLE IF NOT EXISTS shelf_id (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      ALTER TABLE shelf_id
      ADD COLUMN IF NOT EXISTS logo_url TEXT
    `;

    await sql`
      ALTER TABLE shelf_id
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `;

    await sql`
      ALTER TABLE shelf_id
      ADD COLUMN IF NOT EXISTS enabled_sections JSONB NOT NULL DEFAULT '["calendar","tasks","locations","trips","recipes","watchlist"]'::jsonb
    `;

    await sql`
      ALTER TABLE shelf_id
      ALTER COLUMN enabled_sections SET DEFAULT '["calendar","tasks","locations","trips","recipes","watchlist"]'::jsonb
    `;

    const currentShelvesRelationKind = await getRelationKind('shelves');
    if (!currentShelvesRelationKind || currentShelvesRelationKind === 'v') {
      await sql`
        CREATE OR REPLACE VIEW shelves AS
        SELECT id, name, created_by, logo_url, enabled_sections, created_at, updated_at
        FROM shelf_id
      `;
    }

    // Shelf members
    await sql`
      CREATE TABLE IF NOT EXISTS shelf_members (
        shelf_id TEXT REFERENCES shelf_id(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (shelf_id, user_id)
      )
    `;

    // Join codes
    await sql`
      CREATE TABLE IF NOT EXISTS shelf_join_codes (
        id SERIAL PRIMARY KEY,
        shelf_id TEXT REFERENCES shelf_id(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        is_used BOOLEAN DEFAULT false,
        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Shelf data
    await sql`
      CREATE TABLE IF NOT EXISTS shelf_data (
        shelf_id TEXT PRIMARY KEY REFERENCES shelf_id(id) ON DELETE CASCADE,
        data JSONB NOT NULL DEFAULT '{"calendarEvents":[],"tasks":[],"locations":[],"trips":[],"recipes":[],"watchlist":[],"profile":{"users":[]}}'::jsonb,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      ALTER TABLE shelf_data
      ALTER COLUMN data SET DEFAULT '{"calendarEvents":[],"tasks":[],"locations":[],"trips":[],"recipes":[],"watchlist":[],"profile":{"users":[]}}'::jsonb
    `;

    // Password reset tokens (one active token per user)
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username))`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shelf_members_user ON shelf_members(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shelf_join_codes_code ON shelf_join_codes(code)`;

    // Old user_data table (keep for backward compatibility if needed)
    await sql`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    return true;
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    return false;
  }
};

// Keep existing functions for compatibility
export const getUserData = async (userId) => {
  const { rows } = await sql`SELECT data, updated_at FROM user_data WHERE user_id = ${userId}`;
  if (rows.length === 0) return null;
  return { data: rows[0].data, updatedAt: rows[0].updated_at };
};

export const saveUserData = async (userId, data) => {
  const result = await sql`
    INSERT INTO user_data (user_id, data, updated_at)
    VALUES (${userId}, ${JSON.stringify(data)}, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    RETURNING updated_at
  `;
  return { success: true, updatedAt: result.rows[0]?.updated_at };
};

export const deleteUserData = async (userId) => {
  await sql`DELETE FROM user_data WHERE user_id = ${userId}`;
  return true;
};

export const cleanupOldData = async (daysOld = 365) => {
  const { rowCount } = await sql`DELETE FROM user_data WHERE updated_at < NOW() - INTERVAL '1 day' * ${daysOld}`;
  return rowCount;
};

export const checkConnection = async () => {
  try {
    await sql`SELECT 1`;
    return true;
  } catch { return false; }
};

export { sql };
