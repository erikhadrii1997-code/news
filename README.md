# Pulse - Real-time News App

A professional, fully functional, real-time news aggregator web application built with Next.js, TypeScript, and Tailwind CSS. Automatically fetches and displays breaking news from top sources worldwide using NewsAPI.

## Features

- 🚀 **Real-time Updates**: Automatically refreshes news every 5 minutes using Server-Sent Events (SSE)
- 📰 **Premium Sources**: Aggregates news from BBC, Reuters, CNN, The Guardian, WSJ, Bloomberg, TechCrunch, NY Times, and more
- 🎨 **Professional Design**: Clean, modern UI without gradients - professional and sophisticated
- 📱 **Fully Responsive**: Beautiful on all devices - desktop, tablet, and mobile
- ⚡ **High Performance**: Optimized images, fast loading, smooth animations
- 🔄 **Auto-updating**: No user interaction needed - news updates automatically in the background
- ♿ **Accessible**: Semantic HTML and proper ARIA labels for screen readers

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **NewsAPI** - Real-time news data provider
- **Server-Sent Events (SSE)** - Real-time data streaming

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- NewsAPI key (included in .env.local)

### Installation

1. Navigate to the project directory:
```bash
cd news-app
```

2. Install dependencies:
```bash
npm install
```

3. The environment variables are already configured in `.env.local` with the API key.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

You should now see the Pulse news app with live news from top sources!

## Project Structure

```
news-app/
├── app/
│   ├── api/
│   │   └── news/
│   │       └── route.ts          # SSE API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main home page
├── components/
│   ├── ErrorMessage.tsx          # Error display component
│   ├── LoadingSpinner.tsx        # Loading state component
│   ├── Navbar.tsx                # Header navigation
│   └── NewsCard.tsx              # News article card
├── hooks/
│   └── useNews.ts                # Custom hook for SSE news
├── lib/
│   └── types.ts                  # TypeScript type definitions
├── .env.local                    # Environment variables (API key)
├── next.config.ts                # Next.js configuration
└── package.json                  # Dependencies
```

## Key Features Explained

### Real-time Updates
The app uses Server-Sent Events (SSE) to push news updates from the server to the client in real-time. Every 5 minutes, new articles are fetched and automatically displayed without page refresh.

### News Sources
Curated list of premium news sources:
- BBC News
- Reuters
- CNN
- The Guardian
- Wall Street Journal
- Bloomberg
- TechCrunch
- New York Times
- The Verge
- Engadget

### Performance Optimizations
- Next.js Image component for optimized image loading
- Lazy loading for images below the fold
- Efficient SSE connection management
- Clean code and minimal bundle size

## API Configuration

The app uses NewsAPI's free tier. The API key is configured in `.env.local`:

```
NEWS_API_KEY=ea981a6039144952bc3e7b9353f74719
```

**Note**: For production deployment, always use environment variables and never commit API keys to version control.

## Build for Production

To create an optimized production build:

```bash
npm run build
npm start
```

## Customization

### Changing Update Interval
Edit `app/api/news/route.ts` and modify the interval time (currently 300000ms = 5 minutes):

```typescript
const newsInterval = setInterval(fetchAndSendNews, 300000);
```

### Adding News Sources
Edit the `domains` parameter in `app/api/news/route.ts`:

```typescript
domains: 'bbc.co.uk,reuters.com,cnn.com,...',
```

### Styling
All styles use Tailwind CSS. Modify component files in the `components/` directory and global styles in `app/globals.css`.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## License

This project is free to use for personal and commercial purposes.

## Credits

- **NewsAPI** - News data provider
- **Next.js** - React framework
- **Tailwind CSS** - CSS framework
- **Vercel** - Deployment platform

---

**Pulse** - Your real-time news source 🌐
