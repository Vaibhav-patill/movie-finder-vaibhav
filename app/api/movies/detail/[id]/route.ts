import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || "";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") || "detail"; // "detail" | "credits"

  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const movieId = parseInt(id, 10);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const endpoint = type === "credits"
      ? `${TMDB_BASE}/movie/${movieId}/credits`
      : `${TMDB_BASE}/movie/${movieId}`;

    const url = new URL(endpoint);
    url.searchParams.set("api_key", API_KEY);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // cache detail for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `TMDB error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch movie data" }, { status: 500 });
  }
}
