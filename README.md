# Relationship Dashboard

web app for managing everything in a relationship, such as shared calendar, trips, dates, recipes, and tracking movies, TV shows, anime, and books.

## Architecture

### File structure

```
media-tracker/
├── index.html                 # Entry point — loads React, Babel, Tailwind via CDN
├── media-tracker.jsx          # Full React application (self-contained, no build step)
├── config.js                  # API endpoints and app constants
├── package.json               # @vercel/postgres dependency
├── vercel.json                # Vercel function config
├── .env.example               # Environment variable template
│
├── api/
│   ├── data.js               # Serverless function — GET/POST/PUT user data
│   └── health.js             # Serverless function — database health check
│
├── lib/
│   └── db.js                 # Vercel Postgres helpers (getUserData, saveUserData, etc.)
│
├── components/               # Modular components (not loaded by browser — reference only)
│   ├── Icons.jsx
│   ├── MediaCard.jsx
│   ├── SearchModal.jsx
│   ├── GlobalSearchModal.jsx
│   ├── Header.jsx
│   └── UI.jsx
│
└── utils/
    ├── api.js                # External API calls (TMDB, Jikan, Google Books)
    ├── storage.js            # Cloud sync + localStorage fallback
    └── helpers.js            # Shared helper functions
```

### Database schema

```sql
CREATE TABLE user_data (
  user_id    TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

The entire library is one JSONB blob per user:

```json
{
  "movies": [ { "id": "tmdb-123", "title": "...", "status": "watching", ... } ],
  "anime":  [ { "id": "mal-456",  "title": "...", "status": "completed", ... } ],
  "books":  [ { "id": "book-789", "title": "...", "status": "plan-to-read", ... } ]
}
```

The schema is created automatically on the first API call (`CREATE TABLE IF NOT EXISTS` runs in `api/data.js`).

### Status values

**Movies, TV shows, Anime**

| Value | Label |
|---|---|
| `plan-to-watch` | To Watch |
| `watching` | Watching |
| `completed` | Completed |

**Books**

| Value | Label |
|---|---|
| `plan-to-read` | To Read |
| `reading` | Reading |
| `read` | Read |

### API layer (`lib/db.js`)

```javascript
getUserData(userId)           // → { data, updatedAt } | null
saveUserData(userId, data)    // → { success, updatedAt }
deleteUserData(userId)        // → true
cleanupOldData(daysOld)       // → rowCount  (utility, not called by routes)
checkConnection()             // → boolean
initializeDatabase()          // → boolean  (called on cold start in api/data.js)
```

### Storage layer (`utils/storage.js`)

```javascript
getStoredData()         // cloud first, falls back to localStorage cache
saveData(data)          // writes to cloud + localStorage simultaneously
clearStoredData()       // clears cloud + localStorage
exportData()            // returns JSON string of current data
importData(jsonString)  // validates and saves imported data
checkCloudConnection()  // pings /api/health
```

### Environment variables

| Variable | Source | Purpose |
|---|---|---|
| `POSTGRES_URL` | Auto-injected by Vercel Postgres | Pooled connection (used by `@vercel/postgres`) |
| `POSTGRES_URL_NON_POOLING` | Auto-injected by Vercel Postgres | Direct connection |
| `TMDB_API_KEY` | Set manually in Vercel dashboard | Available to serverless functions |

### Adding a new status

1. Add the value to `STATUS_CONFIG` in `config.js` and inline in `media-tracker.jsx`
2. Add a label to `STATUS_LABELS`
3. Add a CSS class to `STATUS_STYLES`
4. Add to `FILTER_CONFIG` for the relevant category

### Adding a new API source

1. Add search function to `utils/api.js`
2. Add endpoint config to `config.js`
3. Mirror the inline equivalent in `media-tracker.jsx`
4. Wire into the `SearchModal` switch statement

---

## APIs

| API | Used for | Key required |
|---|---|---|
| [TMDB](https://www.themoviedb.org/) | Movies & TV shows | Yes (free) |
| [Jikan](https://jikan.moe/) | Anime | No |
| [Google Books](https://books.google.com/) | Books | No |

---

## Tech stack

- React 18 via CDN (no build step)
- Tailwind CSS via CDN
- Vercel Postgres/ Neon (cloud storage, free tier)
- Vercel (hosting, free tier)