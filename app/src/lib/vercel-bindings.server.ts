// Cloudflare bindings are unavailable on Vercel. The inquiry handler returns
// its existing 503 response until a persistent database is connected.
export const env = {};
