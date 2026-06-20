"use client";

import Image from "next/image";
import { Heart, Star, Calendar } from "lucide-react";
import { Movie } from "@/lib/types";
import { POSTER_BASE_URL, formatRating, formatYear } from "@/lib/tmdb";
import { useFavoritesStore } from "@/store/favorites";

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorited = isFavorite(movie.id);

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    toggleFavorite(movie);
  }

  const posterUrl = movie.poster_path
    ? `${POSTER_BASE_URL}${movie.poster_path}`
    : null;

  const rating = movie.vote_average;
  const ratingColor =
    rating >= 7.5 ? "text-emerald-400" : rating >= 6 ? "text-amber-400" : "text-red-400";

  return (
    <article
      onClick={() => onClick(movie)}
      className="group relative bg-zinc-900 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/60 border border-zinc-800 hover:border-zinc-600"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${movie.title}`}
      onKeyDown={(e) => e.key === "Enter" && onClick(movie)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-zinc-800 overflow-hidden">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            <span className="text-zinc-600 text-sm text-center px-4">{movie.title}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-200 z-10
            ${favorited
              ? "bg-rose-500/90 text-white scale-110"
              : "bg-black/40 text-zinc-300 opacity-0 group-hover:opacity-100 hover:bg-rose-500/80 hover:text-white"
            }`}
        >
          <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
        </button>

        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className={`w-3 h-3 fill-current ${ratingColor}`} />
            <span className={`text-xs font-bold ${ratingColor}`}>
              {formatRating(movie.vote_average)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-zinc-100 text-sm leading-tight line-clamp-2 mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1 text-zinc-500">
          <Calendar className="w-3 h-3" />
          <span className="text-xs">{formatYear(movie.release_date)}</span>
        </div>
      </div>
    </article>
  );
}
