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

## Publish

This app can be exported for GitHub Pages under `/design`:

```bash
GITHUB_PAGES=true pnpm build
```

Keep real API keys in local or hosting environment variables. Do not commit `.env.local`.
