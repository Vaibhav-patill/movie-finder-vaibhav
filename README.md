# MovieFinder 🎬

A movie discovery app built with **Next.js 15**, **TypeScript**, **Tailwind CSS v4**, and the **TMDB API**. Browse popular movies, search by title, view detailed info, and save favorites — all persisted to localStorage.

## Live Demo

> Deploy to Vercel and paste URL here.

## Features

- **Browse** — Responsive 12-per-page grid of popular movies with manual pagination (Next / Previous)
- **Search** — Real-time search with 400ms debounce; results update as you type
- **Detail Modal** — Backdrop, cast, genres, runtime, budget/revenue, IMDb link
- **Favorites** — Add/remove with heart button; persists across page reloads via localStorage
- **States** — Skeleton loaders during fetch, clear error messages with retry, empty state with CTA

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| State | Zustand 5 + persist middleware |
| API | TMDB (The Movie Database) |
| Icons | Lucide React |
| Deploy | Vercel |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/movie-finder-vp.git
cd movie-finder-vp
```

### 2. Get a TMDB API key

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to **Settings → API** and request an API key (Developer/Personal use)
3. Copy the **API Key (v3 auth)** value

### 3. Set up environment

```bash
cp .env.local.example .env.local
# Edit .env.local and replace 'your_tmdb_api_key_here' with your actual key
```

### 4. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Architecture

```
app/
  layout.tsx            Root layout with Navbar + Footer
  page.tsx              Home page: browse + search + pagination
  favorites/page.tsx    Saved favorites grid

components/
  MovieCard.tsx         Poster card with rating badge + favorite button
  MovieCardSkeleton.tsx Loading placeholder
  MovieModal.tsx        Detail modal with cast, backdrop, links
  SearchBar.tsx         Controlled input with clear button
  Pagination.tsx        Next/Prev + numbered pages
  Navbar.tsx            Sticky header with favorites count badge
  Footer.tsx            Footer with attribution

lib/
  tmdb.ts               TMDB API helpers (fetch, slice to 12 per page)
  types.ts              TypeScript interfaces

store/
  favorites.ts          Zustand store with localStorage persist

hooks/
  useDebounce.ts        Generic debounce hook
```

## Pagination Design

TMDB returns 20 results per page. To display exactly 12 per app page:

1. For app page n, compute startIndex = (n-1) * 12
2. Determine which two TMDB pages cover that range
3. Fetch both TMDB pages in parallel, concatenate
4. Slice combined[offset : offset + 12]

This ensures every app page has exactly 12 movies, even when the slice crosses a TMDB page boundary.

## Deployment (Vercel)

1. Push repo to GitHub named movie-finder-[yourfirstname]
2. Import project at vercel.com
3. Add environment variable: NEXT_PUBLIC_TMDB_API_KEY = your key
4. Deploy

## Assumptions

- Modal over separate detail page for better UX
- Pagination capped at 500 app pages (TMDB server limit)
- Cast limited to top 8 members for readability
# movie-finder-vaibhav
