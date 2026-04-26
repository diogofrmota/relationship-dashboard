# Shared Shelf

Shared Shelf is a lightweight Vercel-hosted web app for shared planning. Users sign in, create or join shelves, and manage shared calendar events, tasks, date ideas, trips, recipes, and media lists for movies, TV shows, anime, and books.

The app is intentionally simple on the frontend: React, Babel, Tailwind, Leaflet, and Lucide are loaded from CDNs in `index.html`, so local UI changes do not require a build step.

## App Usability

The main user flow is:

1. Sign in or register with an email/username and password. The login form supports "remember me", and password reset links can be sent when Resend is configured.
2. Choose a shelf, create a new shelf, join another shelf with a shelf ID and join code, manage shelf membership, or edit the account profile.
3. Work inside a shelf using the sticky header. The header exposes the shelf name/settings, the global add action, profile/account controls, logout, back-to-shelves, and sync status.
4. Use the shelf sections:
   - Calendar: month grid and event agenda.
   - Tasks: assigned tasks, completion state, ordering, and editing.
   - Date Ideas: saved places with categories, favorites, links, notes, and map display.
   - Trips: upcoming and past trip cards.
   - Recipes: recipe cards, details, editing, and search.
   - Media: TV shows/anime, movies, and books split into status sections.

Shelf data is cached in `localStorage` as a fallback, but authenticated shelf data is persisted to Postgres through the shelf API.

## Tech Stack

- Frontend: React 18 UMD, ReactDOM, Babel Standalone, Tailwind CSS CDN
- UI/runtime libraries: Leaflet for maps, Lucide for icons
- Backend: Vercel Serverless Functions in `api/`
- Database: Vercel Postgres / Neon via `@vercel/postgres`
- Auth: email or username plus password, `bcryptjs` password hashing, JWT sessions via `jsonwebtoken`
- Email: optional Resend integration for password reset mail
- External data: TMDB proxy, Jikan, Open Library, and OpenStreetMap Nominatim proxy

## Repository Structure

```text
shared-shelf/
|-- index.html                  # App entry point, CDN scripts, global CSS/theme, component loading order
|-- media-tracker.jsx           # Main React shell, auth restore, shelf selection, shelf state orchestration
|-- config.js                   # Root app constants/reference; runtime globals are loaded from components/Config.jsx
|-- package.json                # Serverless/runtime dependencies; no npm scripts currently
|-- vercel.json                 # Function duration config and /api/shelf rewrites
|-- AGENTS.md                   # Guidance for AI coding agents
|-- CONTEXT.md                  # Product and UX context
|-- README.md                   # Project documentation
|-- assets/
|   `-- logo.png                # Login/logo asset
|-- api/
|   |-- data.js                 # Legacy route file; current persistence uses shelf/[...path].js
|   |-- health.js               # Database health check
|   |-- nominatim.js            # Nominatim proxy for location search
|   |-- search.js               # TMDB multi-search proxy
|   |-- setup.js                # Initializes database schema
|   |-- tvdetails.js            # TMDB TV details proxy
|   |-- auth/
|   |   |-- forgot-password.js  # Creates password reset token and sends reset email when possible
|   |   |-- login.js            # Email/username login
|   |   |-- me.js               # Current account read/update
|   |   |-- register.js         # Account registration
|   |   `-- reset-password.js   # Password reset token consumption
|   `-- shelf/
|       `-- [...path].js        # Shelf list/create/join/settings/share/data/membership catch-all route
|-- components/
|   |-- AddModal.jsx            # Global add modal and edit modals
|   |-- CalendarView.jsx        # Calendar month/agenda view
|   |-- Config.jsx              # Browser-global constants and legacy helpers
|   |-- DatesView.jsx           # Date idea cards, filters, Nominatim search, map
|   |-- FormRenderer.jsx        # Shared form rendering helper
|   |-- GlobalSearchModal.jsx   # Library-wide search modal
|   |-- Header.jsx              # In-shelf navigation/header
|   |-- Icons.jsx               # Icon wrappers exposed globally
|   |-- JoinShelfModal.jsx      # Create/join shelf modal
|   |-- Login.jsx               # Sign in/register/reset UI
|   |-- MediaCard.jsx           # Media item card and TV/anime progress modal
|   |-- MediaSectionsView.jsx   # Media status sections
|   |-- ProfileModal.jsx        # Shelf settings, sharing, profiles, account modal modes
|   |-- RecipesView.jsx         # Recipe list/detail/edit UI
|   |-- SearchModal.jsx         # Media search/add modal
|   |-- ShareShelfModal.jsx     # Share-code modal
|   |-- ShelfSelector.jsx       # Shelf landing, profile dropdown, shelf management
|   |-- TasksView.jsx           # Task list, editing, completion, ordering
|   `-- TripsView.jsx           # Trip cards and editing
|-- lib/
|   |-- auth-shared.js          # Shared auth, JWT, CORS, Resend, and profile migration helpers
|   `-- db.js                   # Postgres schema initialization and legacy data helpers
|-- utils/
|   |-- api.js                  # Browser-global API/search/auth/shelf helpers
|   |-- helpers.js              # Shared browser helper functions
|   `-- storage.js              # Legacy cloud/localStorage fallback helpers
`-- skills/                     # Local agent skill references; not part of app runtime
```

## Data Model

Current shared-shelf data is stored by shelf:

- `users`: account records with email, username, display name, password hash, and optional provider IDs.
- `shelves`: shelf metadata such as name, owner, logo, and timestamps.
- `shelf_members`: user-to-shelf membership and role.
- `shelf_join_codes`: one-time join codes that expire after seven days.
- `shelf_data`: one JSONB document per shelf.
- `password_reset_tokens`: one active reset token per user.
- `user_data`: legacy per-user JSON table kept for compatibility.

The shelf JSON document can contain:

```json
{
  "tasks": [],
  "movies": [],
  "tvshows": [],
  "books": [],
  "calendarEvents": [],
  "trips": [],
  "recipes": [],
  "dates": [],
  "profile": { "users": [] }
}
```

When adding new fields, keep old saved shelf data rendering by adding normalization or defaults in the loading path.

## API Routes

| Route | Purpose |
| --- | --- |
| `POST /api/auth/register` | Create user account and return a JWT |
| `POST /api/auth/login` | Login with email or username and password |
| `GET /api/auth/me` | Read the current account |
| `PATCH /api/auth/me` | Update account name/username |
| `POST /api/auth/forgot-password` | Create reset token and send email when Resend is configured |
| `POST /api/auth/reset-password` | Reset password from token |
| `GET /api/shelf` | List shelves for the current user |
| `POST /api/shelf` | Create a shelf and initial join code |
| `POST /api/shelf/join` | Join a shelf with shelf ID and join code |
| `PATCH /api/shelf/:id` | Owner-only shelf settings update |
| `GET /api/shelf/:id/share` | Read or create current share code |
| `POST /api/shelf/:id/share` | Owner-only share code regeneration |
| `GET /api/shelf/:id/data` | Read shelf JSON data |
| `POST /api/shelf/:id/data` | Save shelf JSON data |
| `DELETE /api/shelf/:id/membership` | Leave/remove shelf membership for current user |
| `GET /api/health` | Database health check |
| `GET /api/setup` | Initialize database schema |
| `GET /api/search` | TMDB search proxy |
| `GET /api/tvdetails` | TMDB TV details proxy |
| `GET /api/nominatim` | OpenStreetMap Nominatim search proxy |

Shelf routes are consolidated through `api/shelf/[...path].js` and the rewrites in `vercel.json` to stay within the Vercel free-plan function limit.
`api/data.js` remains in the repo as legacy code, but new persistence work should use the shelf-scoped routes.

## Media Status Values

Movies, TV shows, and anime:

| Value | Label |
| --- | --- |
| `plan-to-watch` | To Watch |
| `watching` | Watching |
| `completed` | Completed |

Books:

| Value | Label |
| --- | --- |
| `plan-to-read` | To be Read |
| `reading` | Reading |
| `read` | Read |

Calendar events, trips, tasks, date ideas, and recipes use their own fields instead of media statuses.

## External APIs

| API | Used for | Key required |
| --- | --- | --- |
| TMDB | Movie, TV, and TV episode metadata | Yes, via serverless proxy |
| Jikan | Anime search/details | No |
| Open Library | Book search and covers | No |
| Nominatim | Place/address search | No key, but a User-Agent is recommended |

Do not expose secret keys in frontend files. TMDB calls that need a key should go through `api/search.js` or `api/tvdetails.js`.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `POSTGRES_URL` | Yes | Vercel Postgres/Neon connection used by `@vercel/postgres` |
| `JWT_SECRET` | Recommended | JWT signing secret; code has a development fallback only |
| `TMDB_API_KEY` | Required for TMDB search/details | Server-side TMDB API key |
| `NOMINATIM_USER_AGENT` | Recommended | Identifies the app to Nominatim |
| `RESEND_API_KEY` | Optional | Enables password reset emails |
| `FROM_EMAIL` | Optional | Sender address for Resend mail |
| `APP_URL` | Optional | Base URL used in password reset links |

## Local Development

Install dependencies for serverless functions if needed:

```powershell
npm install
```

For simple frontend checks, serve the repo root:

```powershell
python -m http.server 5173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:5173/index.html
```

Static serving is enough to inspect frontend rendering, but authenticated flows and cloud persistence require the Vercel API environment and Postgres variables.

Useful manual checks after UI or data changes:

- Login, registration, remembered session restore, and password reset screens render.
- Shelf list, create, join, share-code, profile, settings, and leave/manage flows still work.
- Add/edit/delete flows work for the touched shelf section.
- Media search still works for the touched media category.
- Offline/localStorage fallback remains sensible when shelf data cannot be fetched.
- `index.html` loads without console errors.

There are no package scripts or automated tests currently defined in `package.json`. If scripts or tests are added, document them here.

## Implementation Notes

- Keep browser code plain JavaScript/JSX. There is no TypeScript or bundler setup.
- Most browser modules expose functions/components on `window`; respect the script loading order in `index.html`.
- Prefer updating existing API catch-all routes over adding new function files where it fits.
- Validate shelf membership before reading or mutating shelf data.
- Preserve local cache behavior when changing persistence.
- Keep data-shape changes backward compatible with existing JSONB shelf documents.

## Future Ideas

- Buy and configure a custom domain.
- Refine logo/brand usage across login and shelf screens.
- Add onboarding for first shelf setup, member names, and avatars.
- Add shelf theme customization.
- Add an in-app activity feed for recent changes.
- Add shared stats such as dates planned, recipes cooked, and trips taken.
- Confirm Resend sender-domain setup before relying on password reset email in production.
