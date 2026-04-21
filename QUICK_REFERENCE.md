# Quick Reference Guide

## File Structure Overview

### Root Level Files

```
/shelf
├── media-tracker.jsx              # Main app (refactored, 150 lines)
├── config.js                      # ⭐ Centralized configuration & API keys
├── index.html                     # Entry point
├── manifest.json                  # PWA config
├── service-worker.js              # Offline support
├── README.md                      # Original readme
├── REFACTORING_SUMMARY.md         # ⭐ What changed
├── ARCHITECTURE.md                # ⭐ Complete architecture docs
└── CODING_GUIDELINES.md           # ⭐ Development standards
```

### Components Directory

```
/components/
├── Icons.jsx                      # ⭐ SVG icons (6 components)
├── MediaCard.jsx                  # ⭐ Media item display
├── SearchModal.jsx                # ⭐ API search interface
├── GlobalSearchModal.jsx          # ⭐ Library search
├── Header.jsx                     # ⭐ Header & navigation
└── UI.jsx                         # ⭐ Shared UI components
```

### Utils Directory

```
/utils/
├── api.js                         # ⭐ API calls
├── storage.js                     # ⭐ LocalStorage operations
└── helpers.js                     # ⭐ Utility functions
```

## Component Reference

### MediaCard

**Purpose:** Display individual media item
**Props:** `item`, `onStatusChange`
**File:** `components/MediaCard.jsx`

### SearchModal

**Purpose:** Search and add items from APIs
**Props:** `isOpen`, `onClose`, `category`, `onAdd`
**File:** `components/SearchModal.jsx`

### GlobalSearchModal

**Purpose:** Search user's library
**Props:** `isOpen`, `onClose`, `data`, `setActiveTab`
**File:** `components/GlobalSearchModal.jsx`

### Header

**Purpose:** Navigation and action buttons
**Props:** `activeTab`, `onTabChange`, `onSearchClick`, `onAddClick`, `tabs`
**File:** `components/Header.jsx`

### UI Components

- `FilterButton` - Individual filter button
- `FilterBar` - Container for filters
- `EmptyState` - No items display
- `MediaGrid` - Grid layout wrapper
- `LoadingSpinner` - Loading indicator
  **File:** `components/UI.jsx`

## API Reference

### API Functions (`utils/api.js`)

```javascript
searchMovies(query); // Returns Promise<Array>
searchAnime(query); // Returns Promise<Array>
searchBooks(query); // Returns Promise<Array>
```

All return standardized format:

```javascript
{
  (id, // unique identifier
    title, // item title
    thumbnail, // image URL
    rating, // rating number
    year, // release year
    type, // media type
    author); // (books only)
}
```

### Storage Functions (`utils/storage.js`)

```javascript
getStoredData(); // Returns all saved items
saveData(data); // Persist to localStorage
clearStoredData(); // Reset all data
exportData(); // Export as JSON string
importData(jsonString); // Import from JSON
```

### Helper Functions (`utils/helpers.js`)

```javascript
getStatusOptions(category); // Get valid statuses
getFilterOptions(category); // Get filter options
getDefaultStatus(category); // Get default status
formatStatusLabel(status); // Format for display
debounce(func, delay); // Debounce function
filterByQuery(items, query); // Filter items
getCategoryName(category); // Format category
```

### Icon Components (`components/Icons.jsx`)

```javascript
<Search size={20} />
<Plus size={20} />
<Film size={20} />
<Tv size={20} />
<Book size={20} />
<ThreeDots size={16} />
<Close size={24} />
```

## Configuration Reference

### API Configuration

```javascript
// config.js
API_CONFIG.TMDB; // TMDB API settings
API_CONFIG.JIKAN; // Jikan anime API
API_CONFIG.GOOGLE_BOOKS; // Google Books API
```

### Status Configuration

```javascript
STATUS_CONFIG.MOVIES_TV; // Movies/TV statuses
STATUS_CONFIG.BOOKS; // Book statuses
STATUS_LABELS; // Display labels
STATUS_STYLES; // CSS classes
```

### Filter Configuration

```javascript
FILTER_CONFIG.MOVIES_TV; // Movie/TV filters
FILTER_CONFIG.BOOKS; // Book filters
```

## Common Tasks

### Add a New Filter

1. Update `config.js` FILTER_CONFIG
2. Update STATUS_STYLES for CSS
3. Done! Component auto-updates

### Search for Items

```jsx
import { searchMovies } from "./utils/api.js";
const results = await searchMovies("query");
```

### Access Saved Data

```jsx
import { getStoredData } from "./utils/storage.js";
const data = getStoredData(); // { movies: [], anime: [], books: [] }
```

### Update Status

```jsx
const handleStatusChange = (id, newStatus) => {
  // Update logic here
};
```

## API Keys

### Current Location

- **File:** `config.js`
- **Lines:** API_CONFIG section

### To Move to Environment Variables

1. Create `.env` file
2. Set `REACT_APP_TMDB_API_KEY=your_key`
3. Update config.js to use `process.env`

```javascript
// In config.js
export const API_CONFIG = {
  TMDB: {
    API_KEY: process.env.REACT_APP_TMDB_API_KEY || "fallback_key",
  },
};
```

## Status Mapping

### Movies/TV Shows

- `plan-to-watch` → "To Watch"
- `watching` → "Watching"
- `completed` → "Completed"

### Anime

- `plan-to-watch` → "To Watch"
- `watching` → "Watching"
- `completed` → "Completed"

### Books

- `plan-to-read` → "To Read"
- `reading` → "Reading"
- `read` → "Read"

## Responsive Breakpoints

```
Default (Mobile)    < 640px
sm:                 >= 640px   (tablets)
md:                 >= 768px   (small desktop)
lg:                 >= 1024px  (laptop)
xl:                 >= 1280px  (desktop)
2xl:                >= 1536px  (4K)
```

Usage:

```jsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" />
```

## Performance Tips

1. **Debounce search** - Set to 300ms (already done)
2. **Lazy load images** - Images load on demand
3. **Batch state updates** - Use single setState call
4. **Memoize components** - If needed (use React.memo)
5. **Avoid console.log** - Remove in production

## Debugging

### Check Console for Errors

```javascript
// Error logging in place for:
- API errors
- Storage errors
- Search errors
```

### Log Data

```javascript
console.log("Results:", results);
console.log("Stored data:", getStoredData());
```

### Test API

```javascript
// In console:
import { searchMovies } from "./utils/api.js";
searchMovies("Inception").then(console.log);
```

## Troubleshooting

### No Results

- Check API key in config.js
- Verify internet connection
- Check browser console for errors

### Data Not Saving

- Check browser localStorage is enabled
- Look for storage errors in console
- Try clearStoredData() and re-add

### Images Not Loading

- Verify thumbnail URLs in API response
- Check placeholder image URL
- Clear browser cache

## Feature Flags (Future)

When adding features:

```javascript
export const FEATURES = {
  EXPORT_DATA: true,
  OFFLINE_MODE: false,
  ADVANCED_SEARCH: false,
};
```

## Testing Checklist

- [ ] Can search movies, anime, books
- [ ] Can add items to library
- [ ] Can filter by status
- [ ] Can change status via dropdown
- [ ] Can remove items
- [ ] Can search library
- [ ] Data persists on refresh
- [ ] Responsive on mobile/tablet/desktop
- [ ] No errors in console

## Getting Help

1. **Read** - Check ARCHITECTURE.md
2. **Search** - Look for similar patterns in code
3. **Comment** - Code has JSDoc comments
4. **Test** - Verify in browser console
5. **Debug** - Check browser dev tools

## Documentation Files

| File                   | Purpose                     | Read Time |
| ---------------------- | --------------------------- | --------- |
| REFACTORING_SUMMARY.md | What changed overview       | 5 min     |
| ARCHITECTURE.md        | Complete architecture guide | 15 min    |
| CODING_GUIDELINES.md   | Development standards       | 10 min    |
| This file              | Quick reference             | 3 min     |

## Version Info

- **Created:** 2026-02-09
- **React:** 18 (via CDN)
- **Tailwind:** Latest (via CDN)
- **Structure:** Modular architecture
- **Lines:** ~1000 across all files (vs 709 in one file)

---

**Happy coding!** 🚀
