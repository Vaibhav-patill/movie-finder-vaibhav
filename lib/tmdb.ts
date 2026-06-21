import { TMDBResponse, MovieDetail, CreditsResponse } from "./types";

// All calls go to our own Next.js API routes — TMDB key never touches the browser
const RESULTS_PER_PAGE = 12;

export const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
export const PROFILE_BASE_URL = "https://image.tmdb.org/t/p/w185";

/**
 * Fetch exactly 12 popular movies for a given app page.
 * TMDB returns 20/page — we fetch two TMDB pages and slice to 12.
 */
export async function fetchPopularMovies(appPage: number): Promise<TMDBResponse> {
  const startIndex = (appPage - 1) * RESULTS_PER_PAGE;
  const tmdbPage1 = Math.floor(startIndex / 20) + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  const offset = startIndex % 20;

  const [res1, res2] = await Promise.all([
    fetch(`/api/movies/popular?page=${tmdbPage1}`),
    fetch(`/api/movies/popular?page=${tmdbPage2}`),
  ]);

  if (!res1.ok) throw new Error("Failed to fetch movies. Please try again.");
  const data1: TMDBResponse = await res1.json();
  const data2: TMDBResponse = res2.ok ? await res2.json() : { results: [], total_pages: 0, total_results: 0, page: 0 };

  const combined = [...data1.results, ...data2.results];
  const sliced = combined.slice(offset, offset + RESULTS_PER_PAGE);

  const totalResults = data1.total_results;
  const totalAppPages = Math.ceil(Math.min(totalResults, 10000) / RESULTS_PER_PAGE);

  return {
    page: appPage,
    results: sliced,
    total_pages: totalAppPages,
    total_results: totalResults,
  };
}

/**
 * Search movies — returns exactly 12 results per app page.
 */
export async function searchMovies(query: string, appPage: number): Promise<TMDBResponse> {
  if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };

  const startIndex = (appPage - 1) * RESULTS_PER_PAGE;
  const tmdbPage1 = Math.floor(startIndex / 20) + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  const offset = startIndex % 20;

  const encode = encodeURIComponent(query);
  const [res1, res2] = await Promise.all([
    fetch(`/api/movies/search?query=${encode}&page=${tmdbPage1}`),
    fetch(`/api/movies/search?query=${encode}&page=${tmdbPage2}`),
  ]);

  if (!res1.ok) throw new Error("Search failed. Please try again.");
  const data1: TMDBResponse = await res1.json();
  const data2: TMDBResponse = res2.ok ? await res2.json() : { results: [], total_pages: 0, total_results: 0, page: 0 };

  const combined = [...data1.results, ...data2.results];
  const sliced = combined.slice(offset, offset + RESULTS_PER_PAGE);

  const totalResults = data1.total_results;
  const totalAppPages = Math.ceil(Math.min(totalResults, 10000) / RESULTS_PER_PAGE);

  return {
    page: appPage,
    results: sliced,
    total_pages: totalAppPages,
    total_results: totalResults,
  };
}

export async function fetchMovieDetail(id: number): Promise<MovieDetail> {
  const res = await fetch(`/api/movies/detail/${id}?type=detail`);
  if (!res.ok) throw new Error("Movie not found.");
  return res.json();
}

export async function fetchMovieCredits(id: number): Promise<CreditsResponse> {
  const res = await fetch(`/api/movies/detail/${id}?type=credits`);
  if (!res.ok) throw new Error("Credits not found.");
  return res.json();
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatYear(dateString: string): string {
  if (!dateString) return "N/A";
  return dateString.split("-")[0];
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
