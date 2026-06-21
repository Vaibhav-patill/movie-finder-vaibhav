"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  X, Star, Calendar, Clock, Heart, ExternalLink,
  Globe, Film, ChevronRight, ChevronLeft, User,
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

// ─── Cast Slider ────────────────────────────────────────────────────────────
function CastSlider({ cast }: { cast: Cast[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [cast]);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  }

  if (cast.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-300 font-semibold text-sm uppercase tracking-widest flex items-center gap-2">
          <span className="inline-block w-1 h-4 bg-indigo-500 rounded-full" />
          Top Cast
        </h3>
        {/* Arrow buttons — desktop only */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll cast left"
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              canScrollLeft
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                : "bg-zinc-900 text-zinc-700 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll cast right"
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              canScrollRight
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                : "bg-zinc-900 text-zinc-700 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider with gradient fade edges */}
      <div className="relative">
        {/* Left fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        )}
        {/* Right fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide scroll-smooth"
        >
          {cast.map((actor, index) => (
            <CastCard key={actor.id} actor={actor} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CastCard({ actor, index }: { actor: Cast; index: number }) {
  const [imgError, setImgError] = useState(false);
  const profileUrl = actor.profile_path && !imgError
    ? `${PROFILE_BASE_URL}${actor.profile_path}`
    : null;

  // Staggered entrance delay
  const delay = `${index * 40}ms`;

  return (
    <div
      className="flex-shrink-0 w-28 group cursor-default"
      style={{ animationDelay: delay }}
    >
      {/* Photo */}
      <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-zinc-800 mb-2.5 border border-zinc-700/50 group-hover:border-indigo-500/40 transition-all duration-300 shadow-md group-hover:shadow-indigo-500/10 group-hover:shadow-lg">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={actor.name}
            fill
            sizes="112px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <User className="w-8 h-8 text-zinc-600" />
          </div>
        )}

        {/* Hover overlay with character name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
          <p className="text-white text-[10px] leading-tight font-medium line-clamp-2">
            as {actor.character || "—"}
          </p>
        </div>
      </div>

      {/* Name + character below card */}
      <div className="px-0.5">
        <p className="text-zinc-200 text-xs font-semibold leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200">
          {actor.name}
        </p>
        <p className="text-zinc-500 text-[11px] leading-tight line-clamp-1 mt-0.5 group-hover:text-zinc-400 transition-colors duration-200">
          {actor.character || "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
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
      setCast(credits.cast.slice(0, 12));
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
    return () => { document.body.style.overflow = ""; };
  }, [movie, loadDetail]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
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

  const rating = detail?.vote_average ?? movie.vote_average;
  const ratingColor =
    rating >= 7.5 ? "text-emerald-400" : rating >= 6 ? "text-amber-400" : "text-red-400";
  const ratingBg =
    rating >= 7.5 ? "bg-emerald-500/10 border-emerald-500/20" : rating >= 6 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${movie.title}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] bg-zinc-950 sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-zinc-800/80">

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-black/80 transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Backdrop image */}
          <div className="relative h-52 sm:h-72 bg-zinc-900 flex-shrink-0">
            {backdropUrl ? (
              <Image
                src={backdropUrl}
                alt={`${movie.title} backdrop`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative px-4 sm:px-6 pb-6">
            {/* Poster + title row */}
            <div className="flex gap-4 -mt-20 sm:-mt-24 mb-5">
              {posterUrl && (
                <div className="relative w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 border-2 border-zinc-700 shadow-2xl shadow-black/60">
                  <Image
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex flex-col justify-end pb-1 min-w-0">
                <h2 className="text-xl sm:text-3xl font-bold text-white leading-tight drop-shadow-lg">
                  {detail?.title || movie.title}
                </h2>
                {detail?.tagline && (
                  <p className="text-zinc-400 text-sm italic mt-1 leading-snug">
                    &ldquo;{detail.tagline}&rdquo;
                  </p>
                )}
                {/* Genre chips */}
                {detail?.genres && detail.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {detail.genres.map((g) => (
                      <span
                        key={g.id}
                        className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-medium"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {rating > 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${ratingBg} ${ratingColor}`}>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {formatRating(rating)}
                  <span className="text-zinc-500 font-normal text-xs">
                    ({(detail?.vote_count ?? movie.vote_count).toLocaleString()})
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-300 text-sm">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                {formatYear(detail?.release_date || movie.release_date)}
              </div>
              {detail?.runtime ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-300 text-sm">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  {formatRuntime(detail.runtime)}
                </div>
              ) : null}
              {detail?.status && (
                <div className="px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-400 text-xs font-medium">
                  {detail.status}
                </div>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="space-y-3 animate-pulse mt-2">
                <div className="h-3.5 bg-zinc-800 rounded-full w-full" />
                <div className="h-3.5 bg-zinc-800 rounded-full w-5/6" />
                <div className="h-3.5 bg-zinc-800 rounded-full w-4/6" />
                <div className="h-3.5 bg-zinc-800 rounded-full w-3/6 mt-6" />
                <div className="flex gap-3 mt-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0">
                      <div className="w-28 h-36 rounded-xl bg-zinc-800" />
                      <div className="h-3 bg-zinc-800 rounded mt-2 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-8">
                <p className="text-red-400 text-sm mb-3">{error}</p>
                <button
                  onClick={() => loadDetail(movie.id)}
                  className="text-indigo-400 text-sm hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && detail && (
              <>
                {/* Overview */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 text-zinc-300 font-semibold text-sm uppercase tracking-widest mb-3">
                    <span className="inline-block w-1 h-4 bg-indigo-500 rounded-full" />
                    Overview
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {detail.overview || "No overview available."}
                  </p>
                </div>

                {/* Cast slider */}
                <CastSlider cast={cast} />

                {/* Stats grid */}
                {(detail.budget > 0 || detail.revenue > 0 || detail.original_language || detail.production_companies?.length > 0) && (
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 text-zinc-300 font-semibold text-sm uppercase tracking-widest mb-3">
                      <span className="inline-block w-1 h-4 bg-indigo-500 rounded-full" />
                      Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {detail.original_language && (
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                          <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wide">Language</p>
                          <p className="text-zinc-100 text-sm font-semibold uppercase">{detail.original_language}</p>
                        </div>
                      )}
                      {detail.budget > 0 && (
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                          <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wide">Budget</p>
                          <p className="text-zinc-100 text-sm font-semibold">${(detail.budget / 1e6).toFixed(1)}M</p>
                        </div>
                      )}
                      {detail.revenue > 0 && (
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                          <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wide">Revenue</p>
                          <p className={`text-sm font-semibold ${detail.revenue > detail.budget ? "text-emerald-400" : "text-zinc-100"}`}>
                            ${(detail.revenue / 1e6).toFixed(1)}M
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-2">
                  {detail.homepage && (
                    <a
                      href={detail.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all border border-zinc-700 hover:border-zinc-600"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Official Website
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                  {detail.imdb_id && (
                    <a
                      href={`https://www.imdb.com/title/${detail.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all font-medium"
                    >
                      <Film className="w-3.5 h-3.5" />
                      IMDb Page
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-zinc-800 px-4 sm:px-6 py-3.5 flex justify-between items-center bg-zinc-950/90 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-sm transition-colors px-2"
          >
            Close
          </button>
          <button
            onClick={() => toggleFavorite(movie)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 
              ${favorited
                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"
              }`}
          >
            <Heart className={`w-4 h-4 transition-transform duration-200 ${favorited ? "fill-current scale-110" : ""}`} />
            {favorited ? "Remove from Favorites" : "Add to Favorites"}
          </button>
        </div>
      </div>
    </div>
  );
}
