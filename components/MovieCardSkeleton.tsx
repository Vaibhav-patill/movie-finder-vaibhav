export default function MovieCardSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 animate-pulse">
      {/* Poster placeholder */}
      <div className="aspect-[2/3] bg-zinc-800" />
      {/* Info placeholder */}
      <div className="p-3 space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/4" />
      </div>
    </div>
  );
}
