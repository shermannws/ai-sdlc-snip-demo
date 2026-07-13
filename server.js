const port = parseInt(process.env.PORT ?? "3000", 10);
const baseUrl =
  process.env.BASE_URL ??
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : `http://localhost:${port}`);
const publicDir = process.env.PUBLIC_DIR ?? null;

/** @type {Map<string, {code:string,url:string,shortUrl:string,hits:number,createdAt:string}>} */
const links = new Map();

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function generateCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const b of bytes) code += BASE62[b % 62];
  return code;
}

function isValidHttpUrl(str) {
  try {
    const { protocol } = new URL(str);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

async function tryStatic(pathname) {
  if (!publicDir) return null;
  const rel = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const file = Bun.file(`${publicDir}/${rel}`);
  return (await file.exists()) ? new Response(file, { headers: CORS }) : null;
}

Bun.serve({
  port,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    const method = req.method.toUpperCase();

    // ── CORS preflight ────────────────────────────────────────────────────────
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // ── POST /api/links ───────────────────────────────────────────────────────
    if (method === "POST" && pathname === "/api/links") {
      let body;
      try {
        body = await req.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }
      if (!body?.url || !isValidHttpUrl(body.url)) {
        return json({ error: "url must be a valid http(s) URL" }, 400);
      }
      let code;
      do { code = generateCode(); } while (links.has(code));
      const link = {
        code,
        url: body.url,
        shortUrl: `${baseUrl}/${code}`,
        hits: 0,
        createdAt: new Date().toISOString(),
      };
      links.set(code, link);
      return json(link, 201);
    }

    // ── GET /api/links ────────────────────────────────────────────────────────
    if (method === "GET" && pathname === "/api/links") {
      return json([...links.values()]);
    }

    // ── Static files (win over short codes) ───────────────────────────────────
    if (method === "GET") {
      const staticRes = await tryStatic(pathname);
      if (staticRes) return staticRes;
    }

    // ── GET /:code  (redirect) ────────────────────────────────────────────────
    if (method === "GET" && pathname.length > 1) {
      const code = pathname.slice(1);
      const link = links.get(code);
      if (link) {
        link.hits++;
        return new Response(null, {
          status: 302,
          headers: { Location: link.url, ...CORS },
        });
      }
      return json({ error: "Not found" }, 404);
    }

    return json({ error: "Not found" }, 404);
  },
});

console.log(`Snip backend listening on port ${port}`);
console.log(`Base URL: ${baseUrl}`);
if (publicDir) console.log(`Serving static files from: ${publicDir}`);
