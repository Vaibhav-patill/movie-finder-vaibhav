# AI_LOG.md

## Tools Used

- **Claude (claude.ai)** — Main AI assistant used throughout the project for planning the architecture, writing components, TypeScript types, and fixing bugs.
- **GitHub Copilot** — Autocomplete suggestions while editing code manually, mostly for boilerplate and prop types.

---

## Best Prompts

**Prompt 1 — Pagination logic:**
> "I need exactly 12 results per page from an API that returns 20 per page. Write a TypeScript function that maps any app page number to the correct API page(s) and offset, fetching two pages when a boundary falls mid-slice, then returns exactly 12 results."

*Why it worked:* The exact numbers (12 per page vs 20 from API) and the edge case (when a slice crosses two API pages) were spelled out clearly. This gave the AI enough context to get the math right on the first try.

---

**Prompt 2 — Accessible modal:**
> "Refactor this modal to be accessible: trap focus inside when open, close on Escape key, and lock body scroll while visible. Keep it all in a single useEffect with proper cleanup."

*Why it worked:* Grouping all three accessibility requirements into one prompt — and asking for a single `useEffect` — stopped the AI from splitting logic across multiple effects. The result was clean and easy to read.

---

**Prompt 3 — Zustand cart with localStorage:**
> "Set up a Zustand store using the persist middleware targeting localStorage. Explain how to avoid the hydration mismatch where SSR renders an empty array but the client reads saved data, and apply the fix."

*Why it worked:* Describing the specific bug upfront (SSR sees `[]`, client sees saved data) pushed the AI to solve the real problem — adding a `mounted` guard — instead of just writing persistence code that looks right but breaks on first load.

---

## What I Fixed Manually

**Fix 1 — API key exposed in the repository**

After the initial setup, the API key was hardcoded directly in the source file and accidentally pushed to GitHub. I fixed this by:

1. Moving the key into a `.env.local` file:
```
   NEXT_PUBLIC_API_KEY=your_key_here
```
2. Replacing the hardcoded value in the code with `process.env.NEXT_PUBLIC_API_KEY`.
3. Adding `.env.local` to `.gitignore` so it is never committed.
4. Rotating the exposed key from the API provider's dashboard to invalidate the old one.

A simple mistake but an important one — environment variables should always be set up before the first commit.

---

**Fix 2 — Pagination showing duplicate page numbers**

The AI-generated pagination helper had a bug where small page counts (3–5 pages) could show the same page number twice — for example `1, 1, 2, 3`.

I fixed it by clamping the inner range to always start at `2` and end at `totalPages - 1`, so page `1` and the last page are only ever added once by the outer branches. I caught it by clicking through pages on a low-result search and noticing the duplicate in the nav bar. Took about 5 minutes to fix.