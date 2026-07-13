# Snip — Backend

Tiny URL shortener backend built with [Bun](https://bun.sh). Zero npm dependencies.

## API

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/api/links` | `{ "url": "https://…" }` | `201` link object · `400` on bad input |
| `GET` | `/api/links` | — | `200` array of all link objects |
| `GET` | `/:code` | — | `302` redirect · `404` if unknown |

### Link object shape

```json
{
  "code": "aB3xZ9",
  "url": "https://example.com",
  "shortUrl": "https://your-domain/aB3xZ9",
  "hits": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Configuration (environment variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Listening port |
| `BASE_URL` | `http://localhost:<PORT>` | Origin used in `shortUrl`; falls back to `https://$RAILWAY_PUBLIC_DOMAIN` when that variable is set |
| `PUBLIC_DIR` | *(unset)* | When set, serve static files from this folder (`/` → `index.html`). A real file always wins over a short-code with the same name. |

## Running

```bash
bun run start
```

## Notes

- Codes are 6 random base-62 characters.
- Links are stored in memory; data resets on restart.
- Full CORS enabled (open origin) — safe for browser-side apps on any domain.
