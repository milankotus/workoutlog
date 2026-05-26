/**
 * Workout Log sync Worker — Cloudflare KV backend.
 *
 * Replaces the old JSONBin.io proxy. Storage now lives in a KV namespace
 * bound as `WORKOUT_KV`, so there is no third-party hop that can hang.
 *
 * Contract (unchanged from the client's point of view):
 *   GET  /  with `Authorization: Bearer <pin>`  -> returns the stored state JSON
 *   PUT  /  with `Authorization: Bearer <pin>`  -> stores the request body as state
 *   OPTIONS                                       -> CORS preflight
 *
 * Auth: the PIN is compared against the `AUTH_PIN` secret.
 * The state is stored under a single KV key (`STATE_KEY`).
 */

const STATE_KEY = 'state';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function text(body, status) {
  return new Response(body, { status, headers: { ...CORS } });
}

/** True when the request carries the correct `Authorization: Bearer <pin>`. */
function authed(request, env) {
  const header = request.headers.get('Authorization') || '';
  const pin = header.replace(/^Bearer\s+/i, '');
  return pin && env.AUTH_PIN && pin === env.AUTH_PIN;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return text(null, 204);
    }

    if (!authed(request, env)) {
      return text('Unauthorized', 401);
    }

    if (request.method === 'GET') {
      // Return the raw stored JSON, or {} when nothing has been saved yet.
      // (Client only overwrites local data when record.days is non-empty,
      // so {} is a safe "empty" response that won't clobber a fresh device.)
      const stored = await env.WORKOUT_KV.get(STATE_KEY);
      if (!stored) return json({});
      return new Response(stored, {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    if (request.method === 'PUT') {
      const body = await request.text();
      // Validate it parses as JSON before storing, so we never persist garbage.
      try {
        JSON.parse(body);
      } catch {
        return text('Invalid JSON', 400);
      }
      await env.WORKOUT_KV.put(STATE_KEY, body);
      return json({ ok: true });
    }

    return text('Method Not Allowed', 405);
  },
};
