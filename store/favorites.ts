import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Movie } from "@/lib/types";

interface FavoritesState {
  favorites: Movie[];
  addFavorite: (movie: Movie) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (movie: Movie) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (movie) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.id === movie.id)
            ? state.favorites
            : [...state.favorites, movie],
        })),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      toggleFavorite: (movie) => {
        const state = get();
        if (state.isFavorite(movie.id)) {
          state.removeFavorite(movie.id);
        } else {
          state.addFavorite(movie);
        }
      },
    }),
    {
      name: "movie-finder-favorites",
      // Only persist to localStorage after hydration
      skipHydration: false,
    }
  )
);
