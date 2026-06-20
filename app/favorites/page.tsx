"use client";

import { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { Movie } from "@/lib/types";
import { useFavoritesStore } from "@/store/favorites";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoritesStore();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <section className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-rose-400 text-sm font-medium">
            <Heart className="w-4 h-4 fill-current" />
            Your Collection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Favorites</h1>
          <p className="text-zinc-400 text-sm">
            {favorites.length > 0
              ? `${favorites.length} movie${favorites.length === 1 ? "" : "s"} saved`
              : "Movies you love, all in one place"}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
              <Heart className="w-8 h-8 text-zinc-700" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-300 mb-2">No favorites yet</h2>
            <p className="text-zinc-500 text-sm max-w-xs mb-6">
              Browse movies and click the heart icon to save your favorites here.
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  if (confirm(`Remove all ${favorites.length} favorites?`)) {
                    favorites.forEach((m) => removeFavorite(m.id));
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favorites.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={setSelectedMovie}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </main>
  );
}
