"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Heart } from "lucide-react";
import { useFavoritesStore } from "@/store/favorites";

export default function Navbar() {
  const pathname = usePathname();
  const { favorites } = useFavoritesStore();

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white font-bold text-lg hover:text-indigo-400 transition-colors"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Film className="w-4 h-4 text-white" />
          </div>
          <span>MovieFinder</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${pathname === "/"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
          >
            Browse
          </Link>
          <Link
            href="/favorites"
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${pathname === "/favorites"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
          >
            <Heart className="w-4 h-4" />
            Favorites
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {favorites.length > 9 ? "9+" : favorites.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
