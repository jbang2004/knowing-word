/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS?: Fetcher;
  DB?: D1Database;
  MEDIA?: R2Bucket;
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const NARRATION_ROUTE_PREFIX = "/media/narration/v2/";
const NARRATION_OBJECT_PREFIX = "built-in/narration/v2/";
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

function narrationRelativePath(pathname: string) {
  if (!pathname.startsWith(NARRATION_ROUTE_PREFIX)) return null;
  const relative = pathname.slice(NARRATION_ROUTE_PREFIX.length);
  return /^[a-z0-9-]+\/(?:audio\.webm|audio-marks\.json)$/.test(relative)
    ? relative
    : null;
}

function narrationContentType(relative: string) {
  return relative.endsWith(".webm")
    ? "audio/webm; codecs=opus"
    : "application/json; charset=utf-8";
}

function parseByteRange(value: string | null, size: number) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return { invalid: true } as const;

  let start: number;
  let end: number;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return { invalid: true } as const;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= size || end < start) {
    return { invalid: true } as const;
  }
  end = Math.min(end, size - 1);
  return { start, end, length: end - start + 1 } as const;
}

function narrationHeaders(relative: string, size?: number, etag?: string) {
  const headers = new Headers({
    "accept-ranges": "bytes",
    "cache-control": IMMUTABLE_CACHE,
    "content-type": narrationContentType(relative),
    "x-content-type-options": "nosniff",
  });
  if (typeof size === "number") headers.set("content-length", String(size));
  if (etag) headers.set("etag", etag);
  return headers;
}

async function migrateSeededNarration(env: Env, relative: string, objectKey: string) {
  if (!env.DB || !env.MEDIA) return null;
  const seedTag = `builtin:narration:v2:${relative}`;
  const row = await env.DB
    .prepare(
      "SELECT id, object_key FROM recordings WHERE lesson_id = ?1 ORDER BY created_at DESC LIMIT 1",
    )
    .bind(seedTag)
    .first<{ id: string; object_key: string }>();
  if (!row) return null;

  const seed = await env.MEDIA.get(row.object_key);
  if (!seed?.body) return null;
  const bytes = await seed.arrayBuffer();
  await env.MEDIA.put(objectKey, bytes, {
    httpMetadata: {
      cacheControl: IMMUTABLE_CACHE,
      contentType: narrationContentType(relative),
    },
    customMetadata: { assetVersion: "v2", source: "knowing-word" },
  });
  await Promise.all([
    env.MEDIA.delete(row.object_key),
    env.DB.prepare("DELETE FROM recordings WHERE id = ?1").bind(row.id).run(),
  ]);
  return env.MEDIA.head(objectKey);
}

async function serveNarration(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  relative: string,
) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
  }

  const objectKey = `${NARRATION_OBJECT_PREFIX}${relative}`;
  let stored = env.MEDIA ? await env.MEDIA.head(objectKey) : null;
  if (!stored) {
    try {
      stored = await migrateSeededNarration(env, relative, objectKey);
    } catch {
      stored = null;
    }
  }
  if (stored) {
    const headers = narrationHeaders(relative, stored.size, stored.httpEtag);
    headers.set("x-knowing-word-media", "r2");
    if (request.headers.get("if-none-match")?.split(/\s*,\s*/).includes(stored.httpEtag)) {
      headers.delete("content-length");
      return new Response(null, { status: 304, headers });
    }

    const range = parseByteRange(request.headers.get("range"), stored.size);
    if (range && "invalid" in range) {
      headers.set("content-range", `bytes */${stored.size}`);
      headers.delete("content-length");
      return new Response(null, { status: 416, headers });
    }
    if (range) {
      headers.set("content-range", `bytes ${range.start}-${range.end}/${stored.size}`);
      headers.set("content-length", String(range.length));
    }
    if (request.method === "HEAD") return new Response(null, { status: 200, headers });

    const object = await env.MEDIA!.get(
      objectKey,
      range ? { range: { offset: range.start, length: range.length } } : undefined,
    );
    if (!object?.body) return new Response("Media unavailable", { status: 503 });
    return new Response(object.body, { status: range ? 206 : 200, headers });
  }

  if (!env.ASSETS) return new Response("Media not found", { status: 404 });
  const sourceUrl = new URL(`/narration/${relative}`, request.url);
  const sourceRequest = new Request(sourceUrl, {
    method: request.method,
    headers: request.headers,
  });
  sourceRequest.headers.delete("range");
  sourceRequest.headers.delete("if-none-match");
  const source = await env.ASSETS.fetch(sourceRequest);
  if (!source.ok) return new Response("Media not found", { status: 404 });

  const headers = narrationHeaders(relative, Number(source.headers.get("content-length")) || undefined);
  headers.set("x-knowing-word-media", "static-fallback");
  if (request.method === "GET" && env.MEDIA && source.body) {
    const copy = source.clone();
    ctx.waitUntil(
      copy.arrayBuffer().then((bytes) => env.MEDIA!.put(objectKey, bytes, {
        httpMetadata: {
          cacheControl: IMMUTABLE_CACHE,
          contentType: narrationContentType(relative),
        },
        customMetadata: { assetVersion: "v2", source: "knowing-word" },
      })).then(() => undefined),
    );
  }
  return new Response(request.method === "HEAD" ? null : source.body, { status: 200, headers });
}

function withDeliveryCache(response: Response, pathname: string) {
  if (!response.ok) return response;
  const headers = new Headers(response.headers);
  if (pathname.startsWith("/assets/")) {
    headers.set("cache-control", IMMUTABLE_CACHE);
  } else if (
    pathname.startsWith("/illustrations/") ||
    pathname.startsWith("/heritage/") ||
    pathname === "/og-cover.jpg"
  ) {
    headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  } else {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    (globalThis as typeof globalThis & { __KNOWING_WORD_ENV__?: Env }).__KNOWING_WORD_ENV__ = env;
    const url = new URL(request.url);

    const narrationPath = narrationRelativePath(url.pathname);
    if (narrationPath) return serveNarration(request, env, ctx, narrationPath);

    if (url.pathname === "/_vinext/image") {
      // The local Vite preview does not expose the production ASSETS/IMAGES
      // bindings. Fall back to the public source file so visual QA still uses
      // the real project imagery instead of opening the development overlay.
      if (!env.ASSETS || !env.IMAGES) {
        const source = url.searchParams.get("url");
        if (!source || !source.startsWith("/")) return new Response("Invalid image source", { status: 400 });
        return Response.redirect(new URL(source, request.url), 307);
      }
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    return withDeliveryCache(response, url.pathname);
  },
};

export default worker;
