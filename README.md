# Design

Lovable-style, mobile-first Next.js app for generating product design specs with Vertex AI / Gemini.

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Add your server-only key:

```bash
VERTEX_API_KEY=your_vertex_api_key_here
VERTEX_MODEL=gemini-2.5-flash
```

Run locally:

```bash
pnpm dev
```

Open `http://localhost:3001` when port `3000` is already in use.

## GitHub Pages

This app can be exported for GitHub Pages under `/design`:

```bash
GITHUB_PAGES=true pnpm build
```

GitHub Pages is static hosting, so it cannot run the server-only API route. The deployed `/design` version is a safe preview only and does not accept or expose API keys. For live generation, deploy the Next.js app to a server platform and use `.env.local`.

The GitHub Pages prototype uses browser-local auth: account records stay in localStorage and the active session is stored in a `SameSite=Lax` browser cookie. Use a server-backed auth provider for production.
