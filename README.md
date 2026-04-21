# Tracker do Diogo e Mónica

A beautiful, responsive Progressive Web App to track movies, TV shows, anime, and books you want to watch/read.

## Features

✨ **Multi-Category Tracking**

- Movies & TV Shows (via TMDB API)
- Anime (via Jikan/MyAnimeList API)
- Books (via Google Books API)

📱 **Progressive Web App**

- Install on any device (mobile, tablet, desktop)
- Works offline with cached data
- Fast and responsive

🎨 **Beautiful Dark Purple Theme**

- Clean, modern interface
- Smooth animations
- Responsive grid layout

📊 **Status Tracking**

- Plan to Watch/Read
- Currently Watching/Reading
- Completed/Read

🔍 **Smart Filtering**

- Multi-select status filters
- Real-time filtering
- Persistent across sessions

## Setup Instructions

### 1. Get API Keys

1. **TMDB API Key** (Required for Movies/Shows)
   - Go to [The Movie Database](https://www.themoviedb.org/signup)
   - Create a free account
   - Go to Settings > API
   - Request an API key (choose "Developer" option)
   - Copy your API key

2. **Google Books API Key** (Optional for Books)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Books API
   - Create an API key credential

### 2. Local Development Setup

Create a `.env` file in the project root (see `.env.example`):

```bash
cp .env.example .env
# Edit .env and add your actual API keys
```

### 3. Run the App Locally

You need a local web server to run this PWA. Choose one of these methods:

**Option A: Using Python**

```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

**Option B: Using Node.js**

```bash
# Install http-server globally
npm install -g http-server

# Run
http-server -p 8000

# Then open: http://localhost:8000
```

**Option C: Using VS Code**

- Install "Live Server" extension
- Right-click `index.html` and select "Open with Live Server"

### 4. Deployment to Vercel (Free Tier)

1. **Fork/Clone this repository**

2. **Create a Vercel Account** at [vercel.com](https://vercel.com)

3. **Set Up Vercel Postgres**:
   - Go to your Vercel dashboard → Storage → Create Database
   - Choose Postgres, select the free tier
   - Once created, copy the `DATABASE_URL`

4. **Run the Database Schema**:
   - Connect to your database using `psql` or Vercel's query console
   - Run the SQL from `schema.sql` (see below)

5. **Deploy to Vercel**:
   - Import your GitHub repository in Vercel
   - Add Environment Variables:
     - `TMDB_API_KEY`: Your TMDB API key
     - `DATABASE_URL`: The Postgres URL from step 3
   - Deploy!

6. **Post-Deployment**:
   - Your app will be live at `https://your-project.vercel.app`
   - Data is now stored in the cloud and syncs across devices!

## API Information

### Security Note

**API keys are NOT stored in the client-side code for security reasons.** This prevents:

- Unauthorized API usage if keys are leaked
- Rate limit attacks
- Malicious requests appearing from your account

For production deployment, use a backend proxy or serverless functions to inject API keys securely.

### TMDB (Movies & Shows)

- **API**: The Movie Database
- **Cost**: FREE
- **Requires Key**: YES
- **Rate Limit**: 40 requests per 10 seconds
- **Setup**: See instructions above

### Jikan (Anime)

- **API**: Jikan (MyAnimeList)
- **Cost**: FREE
- **Requires Key**: NO
- **Rate Limit**: 3 requests per second (built-in delay)
- **Setup**: Works out of the box!

### Google Books

- **API**: Google Books API
- **Cost**: FREE
- **Requires Key**: NO
- **Rate Limit**: 1000 requests per day
- **Setup**: Works out of the box!

## How to Use

### Adding Items

1. Click the "Add New" button in the top right
2. Search for a movie, show, anime, or book
3. Click on an item to add it to your list
4. Items are automatically added with "Plan to Watch/Read" status

### Changing Status

1. Click the three-dot menu on any card
2. Select a new status:
   - **Movies/Shows/Anime**: Plan to Watch → Watching → Completed
   - **Books**: Plan to Read → Reading → Read
3. Or remove the item from your list

### Filtering

- Use the filter buttons at the top to show/hide items by status
- Multiple filters can be selected at once
- Filters persist when switching between tabs

## File Structure

```
media-tracker/
├── index.html              # Main HTML file
├── media-tracker.jsx       # React application
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
└── README.md              # This file
```

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (iOS 11.3+)
- ✅ Samsung Internet
- ✅ Opera

## Troubleshooting

### "Failed to search" error

- Make sure you've added your TMDB API key
- Check that your API key is valid
- Ensure you have an internet connection

### PWA won't install

- Must be served over HTTPS (localhost is OK)
- Service worker must be registered successfully
- Check browser console for errors

### Images not loading

- Check your internet connection
- Some items may not have images available
- Placeholder images will be shown instead

### Data disappeared

- Check if browser storage was cleared
- Data is stored in localStorage (browser-specific)
- Consider exporting/backing up data periodically

## Future Enhancements

Potential features to add:

- [ ] Cloud sync across devices
- [ ] Export/import data
- [ ] User ratings and reviews
- [ ] Recommendations based on your list
- [ ] Statistics and insights
- [ ] Sharing lists with friends
- [ ] Custom lists/categories
- [ ] Dark/light theme toggle

## Technical Details

- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: LocalStorage
- **PWA**: Service Worker with cache-first strategy
- **APIs**: TMDB, Jikan, Google Books

## Privacy

- All data is stored locally in your browser
- No data is sent to any server (except API requests)
- No tracking or analytics
- No account required

## License

This project is open source and available for personal use.

## Credits

- Movie/TV data from [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Anime data from [MyAnimeList](https://myanimelist.net/) via [Jikan API](https://jikan.moe/)
- Book data from [Google Books](https://books.google.com/)

---

Enjoy tracking your media! 🎬📺📚


# Add to README.md

Database Schema (Run once in Vercel Postgres)
CREATE TABLE IF NOT EXISTS user_data (
  user_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

Needs to be configured in vercel
DATABASE_URL=postgres://...  (Auto-provided when you create Vercel Postgres)
TMDB_API_KEY=your_tmdb_api_key
SETUP_SECRET=some_random_secret_string  (Optional, for the init-db endpoint)