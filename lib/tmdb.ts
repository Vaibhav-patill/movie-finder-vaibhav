import { TMDBResponse, MovieDetail, CreditsResponse } from "./types";

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";

export const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
export const PROFILE_BASE_URL = "https://image.tmdb.org/t/p/w185";

const RESULTS_PER_PAGE = 12;

function buildUrl(path: string, params: Record<string, string | number> = {}): string {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  return url.toString();
}

/**
 * Fetch popular movies for the browse grid.
 * TMDB returns 20 per page; we request 2 TMDB pages and slice to get
 * exactly 12 results for any given app-page number.
 */
export async function fetchPopularMovies(appPage: number): Promise<TMDBResponse> {
  // Each app page of 12 maps to specific slices of TMDB's 20-item pages
  const startIndex = (appPage - 1) * RESULTS_PER_PAGE;
  const tmdbPage1 = Math.floor(startIndex / 20) + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  const offset = startIndex % 20;

  const [res1, res2] = await Promise.all([
    fetch(buildUrl("/movie/popular", { page: tmdbPage1 }), { next: { revalidate: 300 } }),
    fetch(buildUrl("/movie/popular", { page: tmdbPage2 }), { next: { revalidate: 300 } }),
  ]);

  if (!res1.ok) throw new Error(`TMDB error: ${res1.status}`);
  const data1: TMDBResponse = await res1.json();
  const data2: TMDBResponse = res2.ok ? await res2.json() : { results: [], total_pages: 0, total_results: 0, page: 0 };

  const combined = [...data1.results, ...data2.results];
  const sliced = combined.slice(offset, offset + RESULTS_PER_PAGE);

  // Estimate total app pages: TMDB caps at 500 pages × 20 = 10 000 results → 833 app pages
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
 * Search movies by query; returns exactly 12 per app-page.
 */
export async function searchMovies(query: string, appPage: number): Promise<TMDBResponse> {
  if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };

  const startIndex = (appPage - 1) * RESULTS_PER_PAGE;
  const tmdbPage1 = Math.floor(startIndex / 20) + 1;
  const tmdbPage2 = tmdbPage1 + 1;
  const offset = startIndex % 20;

  const [res1, res2] = await Promise.all([
    fetch(buildUrl("/search/movie", { query, page: tmdbPage1 }), { cache: "no-store" }),
    fetch(buildUrl("/search/movie", { query, page: tmdbPage2 }), { cache: "no-store" }),
  ]);

  if (!res1.ok) throw new Error(`TMDB search error: ${res1.status}`);
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
  const res = await fetch(buildUrl(`/movie/${id}`), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Movie not found: ${res.status}`);
  return res.json();
}

export async function fetchMovieCredits(id: number): Promise<CreditsResponse> {
  const res = await fetch(buildUrl(`/movie/${id}/credits`), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Credits not found: ${res.status}`);
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
