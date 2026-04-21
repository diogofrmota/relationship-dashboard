# Coding Guidelines & Best Practices

This document outlines the coding standards and best practices for the Media Tracker project.

## Component Standards

### Structure

```jsx
// 1. Imports
import React from "react";
import { useState } from "react";

// 2. Import utilities
import { formatStatusLabel } from "../utils/helpers.js";

// 3. Component definition
export const ComponentName = ({ prop1, prop2 }) => {
  // 4. State
  const [state, setState] = useState(null);

  // 5. Effects
  useEffect(() => {
    // Do something
  }, [dependency]);

  // 6. Event handlers
  const handleClick = () => {};

  // 7. Render
  return <div>{/* JSX content */}</div>;
};
```

### Naming Conventions

- **Components**: PascalCase (e.g., `MediaCard`, `SearchModal`)
- **Files**: Kebab-case or PascalCase matching component
- **Functions**: camelCase (e.g., `handleStatusChange`)
- **Variables**: camelCase (e.g., `filteredItems`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_KEY`)
- **CSS Classes**: kebab-case (e.g., `group-hover:scale-105`)

### JSDoc Comments

```jsx
/**
 * Brief description of what the component does
 * @param {string} title - Description of title prop
 * @param {Function} onAdd - Callback when item is added
 * @returns {JSX.Element} The rendered component
 */
export const MyComponent = ({ title, onAdd }) => {
  // Implementation
};
```

## Utility Standards

### File Organization

```javascript
// 1. File header comment
/**
 * Brief description of this utility module
 */

// 2. Imports
import { config } from "./config.js";

// 3. Constants (if any)
const DEFAULT_TIMEOUT = 5000;

// 4. Main functions (in order of use)
export const primaryFunction = () => {};
export const secondaryFunction = () => {};

// 5. Private helper functions (not exported)
const privateHelper = () => {};
```

### Error Handling

```javascript
export const searchMovies = async (query) => {
  try {
    // Perform operation
    return data;
  } catch (error) {
    console.error("Specific error context:", error);
    return []; // Return sensible default
  }
};
```

### Consistent Return Format

```javascript
// Good: Consistent format for all API functions
return data.map((item) => ({
  id: item.id,
  title: item.title,
  thumbnail: item.image_url,
  rating: item.rating,
  year: item.year,
}));

// Avoid: Inconsistent formats
return data.map((item) => ({
  ...item, // Don't rely on spread; be explicit
  url: item.image_url, // Don't mix field names
}));
```

## State Management

### State Rules

1. **Keep state minimal** - Only store what changes UI
2. **Derive values** - Calculate rather than store
3. **Batch updates** - Update related state together
4. **Avoid unnecessary state** - Use props when possible

### Good State Practices

```jsx
// ✅ Good: Minimal, necessary state
const [searchQuery, setSearchQuery] = useState("");
const [results, setResults] = useState([]);
const [isLoading, setIsLoading] = useState(false);

// ❌ Avoid: Redundant state
const [results, setResults] = useState([]);
const [resultCount, setResultCount] = useState(0); // Derive from results
```

### Effect Rules

```jsx
// ✅ Include all dependencies
useEffect(() => {
  performSearch(query);
}, [query]); // query is a dependency

// ❌ Avoid: Missing dependencies
useEffect(() => {
  performSearch(query); // query used but not in deps
}, []); // This will cause bugs!

// ✅ Cleanup when needed
useEffect(() => {
  const timer = setTimeout(() => {}, 300);
  return () => clearTimeout(timer); // Cleanup
}, []);
```

## Tailwind CSS Guidelines

### Responsive Breakpoints

```jsx
// Mobile first approach
<div
  className="
  block                      // default (mobile)
  sm:flex                    // >= 640px
  md:grid                    // >= 768px
  lg:flex-col                // >= 1024px
  xl:absolute                // >= 1280px
  2xl:fixed                  // >= 1536px
"
/>
```

### State-Based Styling

```jsx
// ✅ Use conditional classes for state
<button className={`
  px-4 py-2 rounded transition-all
  ${isActive
    ? 'bg-purple-600 text-white'
    : 'bg-slate-800 text-slate-400'
  }
`} />

// ✅ Use group classes for parent-child styling
<div className="group hover:bg-slate-700">
  <span className="group-hover:text-white" />
</div>
```

### Responsive Spacing

```jsx
// ✅ Responsive padding
<div className="p-2 sm:p-3 md:p-4 lg:p-6" />

// ✅ Responsive font sizes
<h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl" />

// ✅ Responsive gaps
<div className="flex gap-1 sm:gap-2 md:gap-3 lg:gap-4" />
```

## Error Handling

### API Errors

```jsx
// ✅ Handle specific errors
try {
  const data = await searchMovies(query);
} catch (error) {
  if (error.response?.status === 401) {
    setError("Invalid API key");
  } else if (error.response?.status === 429) {
    setError("Too many requests. Please try again later.");
  } else {
    setError("Failed to search. Please try again.");
  }
}
```

### Validation

```jsx
// ✅ Validate inputs
export const searchQuery = (query) => {
  if (!query || typeof query !== "string") {
    console.error("Invalid query");
    return null;
  }

  if (query.length < 2) {
    console.error("Query too short");
    return null;
  }

  return query.trim();
};
```

## Performance

### Debouncing

```jsx
// ✅ Use for frequent events (search, resize)
useEffect(() => {
  const performSearch = async () => {
    setResults(await searchMovies(query));
  };

  const debouncedSearch = debounce(performSearch, 300);
  debouncedSearch();
}, [query]);
```

### Memoization (Future)

```jsx
// When needed (after profiling)
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* render */}</div>;
});
```

### Array Operations

```jsx
// ✅ Use filter + map correctly
const results = data
  .filter((item) => item.active)
  .map((item) => ({ ...item, formatted: true }));

// ❌ Avoid: Multiple iterations
const active = data.filter((item) => item.active);
const mapped = active.map((item) => ({ ...item }));
```

## Code Comments

### When to Comment

```jsx
// ✅ Explain WHY, not WHAT
useEffect(() => {
  // Debounce search to avoid overwhelming the API
  const timer = setTimeout(() => search(), 300);
  return () => clearTimeout(timer);
}, []);

// ❌ Don't comment obvious code
// Set loading to true
setIsLoading(true);

// ✅ Comment complex logic
// HACK: API returns both 'null' and empty string for missing values
const getValue = (val) => val ?? "";

// ✅ Mark TODO items
// TODO: Implement offline support for search
```

## Testing Guidelines

### Unit Test Structure

```javascript
describe("searchMovies", () => {
  it("should return formatted movie data", async () => {
    const result = await searchMovies("Inception");
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          rating: expect.any(String),
        }),
      ]),
    );
  });

  it("should handle API errors gracefully", async () => {
    const result = await searchMovies("");
    expect(result).toEqual([]);
  });
});
```

## Configuration Management

### Config Hierarchy

1. **Default values** in `config.js`
2. **Environment variables** override defaults
3. **Runtime configuration** (future)

### Accessing Config

```javascript
// ✅ Import what you need
import { API_CONFIG, STATUS_CONFIG } from "./config.js";

// Access specific values
const API_KEY = API_CONFIG.TMDB.API_KEY;
const DEFAULT_STATUS = STATUS_CONFIG.MOVIES_TV.PLAN_TO_WATCH;
```

## Commit Messages

### Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code reorganization without feature change
- `docs:` Documentation changes
- `style:` Formatting and code style
- `test:` Adding or updating tests
- `perf:` Performance improvements

### Examples

```
feat: Add anime search functionality

- Integrate Jikan API for anime search
- Add anime category to filter options
- Update storage schema for anime items

Closes #42

---

fix: Prevent dropdown menu clipping

- Remove overflow-hidden from parent container
- Position dropdown with bottom-full utility

Closes #15
```

## Security

### Sensitive Data

- ✅ Use environment variables for API keys
- ✅ Never commit `.env` files
- ✅ Validate user input
- ✅ Sanitize displayed data

### LocalStorage Usage

```javascript
// ✅ Only store non-sensitive data
saveData({
  movies: userItems, // OK
  preferences: settings, // OK
  // Never store: passwords, tokens, API keys
});
```

## Accessibility

### ARIA Labels

```jsx
// ✅ Provide context for screen readers
<button
  onClick={handleSearch}
  aria-label="Search for movies"
>
  <Search size={18} />
</button>

// ✅ Label form inputs
<label htmlFor="search-input">Search</label>
<input id="search-input" type="text" />
```

## Documentation

### README Sections

- What the app does
- How to install/run
- Project structure
- Contributing guidelines
- Tech stack
- Known issues

### Inline Documentation

- Complex algorithms: explain logic
- Gotchas: document why code is written certain way
- Performance-critical sections: explain optimization
- Integration points: document expected return formats

## Review Checklist

Before pushing code:

- [ ] Follows naming conventions
- [ ] Includes JSDoc comments
- [ ] Has error handling
- [ ] Responsive design considered
- [ ] No console.log left behind
- [ ] No hardcoded magic strings
- [ ] Consistent with existing patterns
- [ ] Tested locally
- [ ] Commit message is clear

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)
- [JavaScript.info](https://javascript.info)

---

Following these guidelines ensures the codebase remains clean, maintainable, and professional.
