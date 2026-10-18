# Vercel deployment

Import `AhmedKvz/Ana-International-Group-LLC` and select `app` as the Root Directory.
The committed `app/vercel.json` configures TanStack Start, Bun installation and
the build command. Vercel sets `VERCEL=1`, enabling Nitro's Vercel output.

The existing Cloudflare build remains available without `VERCEL=1`.

## Inquiry storage

The original quote endpoint stores inquiries in Cloudflare D1. That binding is
not available on Vercel. Until a persistent database is connected, valid quote
submissions return HTTP 503 and the form displays an error. No inquiry is
reported as received without confirmed storage. Connect a database and migrate
the schema in `app/migrations/0002_quotes.sql` before relying on the form.

## Local verification

From `app`, run `bun install --frozen-lockfile` and `VERCEL=1 bun run build`.
The build also runs TypeScript validation and emits `.vercel/output`.
