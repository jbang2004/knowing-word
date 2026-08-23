/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { runWithRuntimeEnv } from "../app/lib/runtime-env.ts";

type RuntimeEnv = Partial<Env> & { IMAGES?: ImagesBinding };

const NARRATION_VERSIONS = new Set(["v2", "v3"]);
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

function narrationRequestPath(pathname: string) {
  const match = /^\/media\/narration\/(v\d+)\/([a-z0-9-]+\/(?:audio\.webm|audio-marks\.json))$/.exec(pathname);
  if (!match || !NARRATION_VERSIONS.has(match[1])) return null;
  return { version: match[1], relative: match[2] };
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

async function serveNarration(
  request: Request,
  env: RuntimeEnv,
  ctx: ExecutionContext,
  version: string,
  relative: string,
) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
  }

  const objectKey = `built-in/narration/${version}/${relative}`;
  const stored = env.MEDIA ? await env.MEDIA.head(objectKey) : null;
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

  // v3 is R2-only. Falling back to the v2 static path would silently pair the
  // new transcript/timing data with old audio, so a missing v3 object must fail closed.
  if (version !== "v2" || !env.ASSETS) return new Response("Media not found", { status: 404 });
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
        customMetadata: { assetVersion: version, source: "knowing-word" },
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

function isDeliveryAsset(pathname: string) {
  return pathname.startsWith("/assets/") ||
    pathname.startsWith("/illustrations/") ||
    pathname.startsWith("/heritage/") ||
    pathname === "/og-cover.jpg";
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: RuntimeEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const narrationPath = narrationRequestPath(url.pathname);
    if (narrationPath) {
      return serveNarration(request, env, ctx, narrationPath.version, narrationPath.relative);
    }

    if (isDeliveryAsset(url.pathname) && env.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return withDeliveryCache(asset, url.pathname);
    }

    if (url.pathname === "/_vinext/image") {
      // The local Vite preview does not expose the production ASSETS/IMAGES
      // bindings. Fall back to the public source file so visual QA still uses
      // the real project imagery instead of opening the development overlay.
      if (!env.ASSETS || !env.IMAGES) {
        const source = url.searchParams.get("url");
        if (!source || !source.startsWith("/")) return new Response("Invalid image source", { status: 400 });
        return Response.redirect(new URL(source, request.url), 307);
      }
      const assets = env.ASSETS;
      const images = env.IMAGES;
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => assets.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const outputFormat = format === "image/avif"
            || format === "image/jpeg"
            || format === "image/webp"
            || format === "image/png"
            || format === "image/gif"
            || format === "rgb"
            || format === "rgba"
            ? format
            : "image/webp";
          const result = await images.input(body).transform(width > 0 ? { width } : {}).output({
            format: outputFormat,
            quality,
          });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await runWithRuntimeEnv(env, () => handler.fetch(request, env, ctx));
    return withDeliveryCache(response, url.pathname);
  },
};

export default worker satisfies ExportedHandler<RuntimeEnv>;
