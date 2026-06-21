import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";
// No NEXT_PUBLIC_ prefix — this variable is NEVER sent to the browser
const API_KEY = process.env.TMDB_API_KEY || "";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = searchParams.get("page") || "1";

  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const url = new URL(`${TMDB_BASE}/movie/popular`);
    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("page", page);

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 }, // cache popular results for 5 min
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
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
