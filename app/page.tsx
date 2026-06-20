"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Film, AlertCircle, SearchX } from "lucide-react";
import { Movie, TMDBResponse } from "@/lib/types";
import { fetchPopularMovies, searchMovies } from "@/lib/tmdb";
import { useDebounce } from "@/hooks/useDebounce";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import MovieModal from "@/components/MovieModal";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<TMDBResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const prevQueryRef = useRef(debouncedQuery);

  const loadMovies = useCallback(async (q: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = q.trim()
        ? await searchMovies(q.trim(), p)
        : await fetchPopularMovies(p);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery !== prevQueryRef.current) {
      prevQueryRef.current = debouncedQuery;
      setPage(1);
      loadMovies(debouncedQuery, 1);
    } else {
      loadMovies(debouncedQuery, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, page, loadMovies]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isSearchMode = debouncedQuery.trim().length > 0;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero / Search header */}
      <section className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-indigo-400 text-sm font-medium">
            <Film className="w-4 h-4" />
            {isSearchMode ? "Search Results" : "Popular Right Now"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {isSearchMode ? (
              <>
                Results for{" "}
                <span className="text-indigo-400">&ldquo;{debouncedQuery}&rdquo;</span>
              </>
            ) : (
              "Discover Movies"
            )}
          </h1>
          <p className="text-zinc-400 text-sm mb-8 max-w-md mx-auto">
            {isSearchMode
              ? `${data?.total_results?.toLocaleString() ?? 0} movies found`
              : "Browse the most popular movies or search for any title"}
          </p>

          <SearchBar value={query} onChange={setQuery} />
        </div>
      </section>

      {/* Grid section */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h2 className="text-lg font-semibold text-zinc-200 mb-2">Something went wrong</h2>
            <p className="text-zinc-500 text-sm max-w-sm mb-6">{error}</p>
            <button
              onClick={() => loadMovies(debouncedQuery, page)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty / no results */}
        {!loading && !error && data && data.results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SearchX className="w-12 h-12 text-zinc-600 mb-4" />
            <h2 className="text-lg font-semibold text-zinc-300 mb-2">No movies found</h2>
            <p className="text-zinc-500 text-sm max-w-sm">
              {isSearchMode
                ? `We couldn&apos;t find any movies matching &quot;${debouncedQuery}&quot;. Try a different title.`
                : "No movies available right now. Please check back later."}
            </p>
            {isSearchMode && (
              <button
                onClick={() => setQuery("")}
                className="mt-5 px-4 py-2 bg-zinc-800 text-zinc-200 rounded-xl text-sm hover:bg-zinc-700 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Movie grid */}
        {!loading && !error && data && data.results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={setSelectedMovie}
                />
              ))}
            </div>

            <p className="text-center text-zinc-600 text-xs mt-6">
              Showing {data.results.length} of {data.total_results.toLocaleString()} results
              {" · "}Page {page} of {data.total_pages.toLocaleString()}
            </p>

            <Pagination
              currentPage={page}
              totalPages={Math.min(data.total_pages, 500)}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>

      {/* Movie detail modal */}
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </main>
  );
}
