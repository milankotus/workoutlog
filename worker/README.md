# Workout Log sync Worker

Cloudflare Worker that backs cloud sync for the workout log. Storage is a
Cloudflare KV namespace (`WORKOUT_KV`) — no third-party service.

- Deployed URL: `https://workout-sync.milan-kotus.workers.dev` (hard-coded in `index.html`)
- Auth: PIN compared against the `AUTH_PIN` secret
- Data: single KV key `state` holding the full app state JSON

## API

| Method | Auth                       | Effect                                  |
|--------|----------------------------|-----------------------------------------|
| GET    | `Authorization: Bearer <pin>` | Returns stored state JSON, or `{}`   |
| PUT    | `Authorization: Bearer <pin>` | Stores request body as state         |
| OPTIONS| —                          | CORS preflight                          |

## Deploy

```sh
npm install -g wrangler        # if not installed
wrangler login

# Create the KV namespace, then paste the printed id into wrangler.toml:
wrangler kv namespace create WORKOUT_KV

# Set the PIN secret (skip if it already exists on the Worker — it persists across deploys):
wrangler secret put AUTH_PIN

wrangler deploy
```

Deploying with `name = "workout-sync"` overwrites the existing Worker in place,
so the URL and the `AUTH_PIN` secret are preserved. The old JSONBin secrets
(`JSONBIN_KEY`, `JSONBIN_BIN`) become unused and can be deleted from the
Cloudflare dashboard.

## Re-seeding data

JSONBin held the previous cloud copy. After switching to KV the namespace is
empty, so on first load the Worker returns `{}` and the app keeps its local
`localStorage` data untouched. Make any small change (or just let the next
`save()` fire) on your primary device to push that local state up as the new
KV seed.
