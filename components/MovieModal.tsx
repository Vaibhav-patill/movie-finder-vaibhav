"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  X, Star, Calendar, Clock, Heart, ExternalLink,
  Globe, Film, ChevronRight
} from "lucide-react";
import { Movie, MovieDetail, Cast } from "@/lib/types";
import {
  fetchMovieDetail, fetchMovieCredits,
  BACKDROP_BASE_URL, POSTER_BASE_URL, PROFILE_BASE_URL,
  formatRating, formatYear, formatRuntime,
} from "@/lib/tmdb";
import { useFavoritesStore } from "@/store/favorites";

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const loadDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const [movieDetail, credits] = await Promise.all([
        fetchMovieDetail(id),
        fetchMovieCredits(id),
      ]);
      setDetail(movieDetail);
      setCast(credits.cast.slice(0, 8));
    } catch {
      setError("Failed to load movie details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!movie) {
      setDetail(null);
      setCast([]);
      setError(null);
      return;
    }
    loadDetail(movie.id);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [movie, loadDetail]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!movie) return null;

  const favorited = isFavorite(movie.id);
  const backdropUrl = (detail?.backdrop_path || movie.backdrop_path)
    ? `${BACKDROP_BASE_URL}${detail?.backdrop_path || movie.backdrop_path}`
    : null;
  const posterUrl = (detail?.poster_path || movie.poster_path)
    ? `${POSTER_BASE_URL}${detail?.poster_path || movie.poster_path}`
    : null;

  const rating = (detail?.vote_average ?? movie.vote_average);
  const ratingColor =
    rating >= 7.5 ? "text-emerald-400" : rating >= 6 ? "text-amber-400" : "text-red-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${movie.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] bg-zinc-950 sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-zinc-800">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-black/70 transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Backdrop image */}
          <div className="relative h-48 sm:h-64 bg-zinc-900 flex-shrink-0">
            {backdropUrl ? (
              <Image
                src={backdropUrl}
                alt={`${movie.title} backdrop`}
                fill
                className="object-cover"
                priority
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative px-4 sm:px-6 pb-6">
            <div className="flex gap-4 -mt-16 sm:-mt-20 mb-4">
              {/* Poster */}
              {posterUrl && (
                <div className="relative w-24 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 border-2 border-zinc-700 shadow-xl">
                  <Image
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title / meta */}
              <div className="flex flex-col justify-end pb-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {detail?.title || movie.title}
                </h2>
                {detail?.tagline && (
                  <p className="text-zinc-400 text-sm italic mt-0.5">{detail.tagline}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {detail?.genres?.map((g) => (
                    <span
                      key={g.id}
                      className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-sm">
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className={`w-4 h-4 fill-current ${ratingColor}`} />
                  <span className={`font-bold ${ratingColor}`}>{formatRating(rating)}</span>
                  <span className="text-zinc-500 text-xs">
                    ({detail?.vote_count?.toLocaleString() ?? movie.vote_count} votes)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span>{formatYear(detail?.release_date || movie.release_date)}</span>
              </div>
              {detail?.runtime && (
                <div className="flex items-center gap-1 text-zinc-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatRuntime(detail.runtime)}</span>
                </div>
              )}
              {detail?.status && (
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {detail.status}
                </span>
              )}
            </div>

            {/* Loading / Error states */}
            {loading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-full" />
                <div className="h-4 bg-zinc-800 rounded w-5/6" />
                <div className="h-4 bg-zinc-800 rounded w-4/6" />
              </div>
            )}

            {error && (
              <div className="text-center py-6">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={() => loadDetail(movie.id)}
                  className="mt-3 text-indigo-400 text-sm hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && detail && (
              <>
                {/* Overview */}
                <div className="mb-5">
                  <h3 className="text-zinc-300 font-semibold text-sm uppercase tracking-wider mb-2">
                    Overview
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {detail.overview || "No overview available."}
                  </p>
                </div>

                {/* Cast */}
                {cast.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-zinc-300 font-semibold text-sm uppercase tracking-wider mb-3">
                      Top Cast
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {cast.map((actor) => (
                        <div key={actor.id} className="flex-shrink-0 w-16 text-center">
                          <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden bg-zinc-800 mb-1.5">
                            {actor.profile_path ? (
                              <Image
                                src={`${PROFILE_BASE_URL}${actor.profile_path}`}
                                alt={actor.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Film className="w-5 h-5 text-zinc-600" />
                              </div>
                            )}
                          </div>
                          <p className="text-zinc-300 text-xs font-medium leading-tight line-clamp-2">
                            {actor.name}
                          </p>
                          <p className="text-zinc-600 text-xs leading-tight line-clamp-1">
                            {actor.character}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional info */}
                {(detail.budget > 0 || detail.revenue > 0 || detail.original_language) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    {detail.original_language && (
                      <div className="bg-zinc-900 rounded-lg p-3">
                        <p className="text-zinc-500 text-xs mb-1">Language</p>
                        <p className="text-zinc-200 text-sm font-medium uppercase">
                          {detail.original_language}
                        </p>
                      </div>
                    )}
                    {detail.budget > 0 && (
                      <div className="bg-zinc-900 rounded-lg p-3">
                        <p className="text-zinc-500 text-xs mb-1">Budget</p>
                        <p className="text-zinc-200 text-sm font-medium">
                          ${(detail.budget / 1e6).toFixed(1)}M
                        </p>
                      </div>
                    )}
                    {detail.revenue > 0 && (
                      <div className="bg-zinc-900 rounded-lg p-3">
                        <p className="text-zinc-500 text-xs mb-1">Revenue</p>
                        <p className="text-zinc-200 text-sm font-medium">
                          ${(detail.revenue / 1e6).toFixed(1)}M
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-2">
                  {detail.homepage && (
                    <a
                      href={detail.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {detail.imdb_id && (
                    <a
                      href={`https://www.imdb.com/title/${detail.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                    >
                      IMDb
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 border-t border-zinc-800 px-4 sm:px-6 py-3 flex justify-between items-center bg-zinc-950">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => toggleFavorite(movie)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${favorited
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
            {favorited ? "Remove from Favorites" : "Add to Favorites"}
          </button>
        </div>
      </div>
    </div>
  );
}
