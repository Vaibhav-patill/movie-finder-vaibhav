import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || "";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("query") || "";
  const page = searchParams.get("page") || "1";

  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  if (!query.trim()) {
    return NextResponse.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
  }

  try {
    const url = new URL(`${TMDB_BASE}/search/movie`);
    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("query", query);
    url.searchParams.set("page", page);

    const res = await fetch(url.toString(), {
      cache: "no-store", // search results must always be fresh
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `TMDB search error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to search movies" }, { status: 500 });
  }
}
