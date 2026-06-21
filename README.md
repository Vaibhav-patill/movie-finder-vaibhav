# MovieFinder 🎬

> A movie discovery app built with **Next.js 15**, **TypeScript**, **Tailwind CSS v4**, and the **TMDB API**.

Browse popular movies, search by title, view detailed cast info, and save favorites — all with your API key fully secured server-side.

---

## 🔗 Links

- **Live Demo:** (https://movie-finder-vaibhav.vercel.app/)
- **GitHub Repo:** (https://github.com/Vaibhav-patill/movie-finder-vaibhav)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎬 Browse | Responsive grid — exactly 12 movies per page |
| 🔍 Search | Live search with 400ms debounce |
| 📄 Detail Modal | Backdrop, genres, runtime, budget, revenue, IMDb link |
| 🎭 Cast Slider | Portrait cards with arrow buttons, gradient fades, hover overlay |
| ❤️ Favorites | Persists across reloads via localStorage |
| 🔒 Secure API | Key lives server-side only — never visible in browser DevTools |
| ⏳ Loading | Skeleton cards while fetching |
| ⚠️ Error | Clear message with retry button |
| 🔮 Empty | Helpful CTA when no results found |
| 📱 Responsive | Mobile, tablet, and desktop |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| State | Zustand 5 + persist middleware |
| API | TMDB — The Movie Database |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Free TMDB API key (instructions below)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/movie-finder-vaibhav.git
cd movie-finder-vaibhav
```

### 2. Get a free TMDB API key

1. Sign up free at [themoviedb.org](https://www.themoviedb.org/signup)
2. Verify your email
3. Go to **Settings → API → Request an API Key → Developer**
4. Fill in App Name: `Movie Finder`, App URL: `https://localhost`, Summary: `Personal project`
5. Copy the **API Key (v3 auth)**

> ✅ TMDB is completely free — no credit card required.

### 3. Set up environment variables

```bash
cp .env .env.local
```

Open `.env.local` and set your key:

```env
TMDB_API_KEY=paste_your_key_here
```

> ⚠️ Note: The variable is `TMDB_API_KEY`, **not** `NEXT_PUBLIC_TMDB_API_KEY`.
> The `NEXT_PUBLIC_` prefix would expose the key in the browser bundle. This app keeps it server-side only.

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
movie-finder-vp/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout — Navbar + Footer
│   ├── page.tsx                      # Home: browse + search + pagination
│   ├── globals.css                   # Global styles + scrollbar-hide utility
│   ├── favicon.ico
│   │
│   ├── favorites/
│   │   └── page.tsx                  # Saved favorites grid
│   │
│   └── api/                          # Server-side API proxy routes
│       └── movies/
│           ├── popular/
│           │   └── route.ts          # GET /api/movies/popular?page=n
│           ├── search/
│           │   └── route.ts          # GET /api/movies/search?query=x&page=n
│           └── detail/
│               └── [id]/
│                   └── route.ts      # GET /api/movies/detail/:id?type=detail|credits
│
├── components/
│   ├── MovieCard.tsx                 # Poster card with rating badge + heart button
│   ├── MovieCardSkeleton.tsx         # Animated loading placeholder
│   ├── MovieModal.tsx                # Detail modal + cast slider
│   ├── SearchBar.tsx                 # Controlled input with clear button
│   ├── Pagination.tsx                # Previous / Next + ellipsis page numbers
│   ├── Navbar.tsx                    # Sticky header with favorites count badge
│   └── Footer.tsx                    # "Built for Jeevan — VP"
│
├── lib/
│   ├── tmdb.ts                       # API helpers — calls /api/* routes, not TMDB directly
│   └── types.ts                      # TypeScript interfaces (Movie, MovieDetail, Cast…)
│
├── store/
│   └── favorites.ts                  # Zustand store with localStorage persistence
│
├── hooks/
│   └── useDebounce.ts                # Generic debounce hook (400ms default)
│
├── public/                           # Static assets
│
├── AI_LOG.md                         # AI tool usage log (assignment requirement R3)
├── .env.local.example                # Environment variable template
├── .gitignore
├── next.config.ts                    # Image domain config for image.tmdb.org
├── tsconfig.json
└── README.md
```

---

## 🔒 API Key Security

This app uses a **server-side proxy pattern** to keep the TMDB key hidden.

**How it works:**

```
Browser → /api/movies/popular   →   Next.js Server (has TMDB_API_KEY)   →   TMDB API
```

- The browser never contacts TMDB directly
- The API key is read from `process.env.TMDB_API_KEY` on the server
- Users see `/api/movies/popular?page=1` in Network tab — key is invisible

**The 3 proxy routes:**

| Route | Proxies to |
|-------|-----------|
| `GET /api/movies/popular?page=n` | `tmdb.org/movie/popular` |
| `GET /api/movies/search?query=x&page=n` | `tmdb.org/search/movie` |
| `GET /api/movies/detail/:id?type=detail` | `tmdb.org/movie/:id` |
| `GET /api/movies/detail/:id?type=credits` | `tmdb.org/movie/:id/credits` |

---

## ☁️ Deploying to Vercel

1. Push to GitHub — name the repo `movie-finder-[yourfirstname]`
2. Go to [vercel.com](https://vercel.com) → **Import Project** → select your repo
3. Add environment variable:
   - **Name:** `TMDB_API_KEY`
   - **Value:** your TMDB key
4. Click **Deploy** — live in ~60 seconds

> If you previously deployed with `NEXT_PUBLIC_TMDB_API_KEY`, delete that variable and add `TMDB_API_KEY` instead.

---


## 💡 Design Decisions

- **Server proxy over NEXT_PUBLIC key** — `NEXT_PUBLIC_` bakes the value into the JS bundle; a server route prevents any exposure
- **Modal over detail page** — keeps grid context visible; works as a bottom sheet on mobile
- **Zustand + persist** — minimal boilerplate; handles localStorage serialization and SSR hydration automatically
- **Portrait cast cards over circles** — more photo surface area, closer to how streaming platforms present cast
- **400ms debounce** — fast enough to feel live, slow enough to avoid hammering the API per keystroke
- **Pagination capped at 500** — TMDB rejects requests beyond page 500; prevents dead-end navigation

---

## 🔮 Future Improvements

- Trailer playback via TMDB `/videos` endpoint
- Genre filter chips on the browse page
- URL-based state for search + page (shareable links)
- PWA manifest for offline favorites
- Dark / light theme toggle

---

## 📝 Notes

- Data source: [The Movie Database (TMDB)](https://www.themoviedb.org/) — free, non-commercial use
- *This product uses the TMDB API but is not endorsed or certified by TMDB.*
- Built for: **Jeevan** — Vaibhav