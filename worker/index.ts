/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { runWithRuntimeEnv } from "../app/lib/runtime-env.ts";

type RuntimeEnv = Partial<Env> & {
  IMAGES?: ImagesBinding;
  NARRATION_SOURCE?: { fetch(request: Request): Promise<Response> };
};

const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
const NARRATION_SOURCE_COMMIT = "0e30da7f66f68b92bc06dcfed857cfc31a64b89d";
const NARRATION_SOURCE_ORIGIN = "https://raw.githubusercontent.com/jbang2004/knowing-word";
const MAX_NARRATION_BYTES = 2 * 1024 * 1024;
const MINI_FONT_PATH = "/api/mini-font/v1/lxgw-wenkai.woff2";
const MINI_FONT_ASSET_PATH = "/fonts/lxgw-wenkai-subset.woff2";

function narrationRequestPath(pathname: string) {
  const match = /^\/media\/narration\/(v\d+)\/([a-z0-9-]+\/(?:audio\.(?:webm|m4a)|audio-marks\.json))$/.exec(pathname);
  if (!match || !new Set(["v5"]).has(match[1])) return null;
  return { version: match[1], relative: match[2] };
}

function narrationContentType(relative: string) {
  if (relative.endsWith(".webm")) return "audio/webm; codecs=opus";
  if (relative.endsWith(".m4a")) return "audio/mp4";
  return "application/json; charset=utf-8";
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

function narrationSourceUrl(relative: string) {
  const sourceRoot = relative.endsWith(".m4a")
    ? "release/miniprogram-narration-aac32"
    : "release/narration";
  return `${NARRATION_SOURCE_ORIGIN}/${NARRATION_SOURCE_COMMIT}/${sourceRoot}/${relative}`;
}

async function mirrorNarrationToR2(
  request: Request,
  env: RuntimeEnv,
  objectKey: string,
  relative: string,
) {
  if (!env.MEDIA) return null;
  const sourceRequest = new Request(narrationSourceUrl(relative), {
    headers: { accept: narrationContentType(relative) },
  });
  const upstream = env.NARRATION_SOURCE
    ? await env.NARRATION_SOURCE.fetch(sourceRequest)
    : await fetch(sourceRequest);
  if (!upstream.ok) return null;

  const announcedSize = Number(upstream.headers.get("content-length"));
  if (Number.isFinite(announcedSize) && announcedSize > MAX_NARRATION_BYTES) return null;
  const bytes = await upstream.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_NARRATION_BYTES) return null;

  const stored = await env.MEDIA.put(objectKey, bytes, {
    httpMetadata: {
      contentType: narrationContentType(relative),
      cacheControl: IMMUTABLE_CACHE,
    },
    customMetadata: {
      sourceCommit: NARRATION_SOURCE_COMMIT,
    },
  });
  const headers = narrationHeaders(relative, bytes.byteLength, stored.httpEtag);
  headers.set("x-knowing-word-media", "r2");

  const range = parseByteRange(request.headers.get("range"), bytes.byteLength);
  if (range && "invalid" in range) {
    headers.set("content-range", `bytes */${bytes.byteLength}`);
    headers.delete("content-length");
    return new Response(null, { status: 416, headers });
  }
  if (range) {
    headers.set("content-range", `bytes ${range.start}-${range.end}/${bytes.byteLength}`);
    headers.set("content-length", String(range.length));
  }
  if (request.method === "HEAD") return new Response(null, { status: 200, headers });

  const body = range ? bytes.slice(range.start, range.end + 1) : bytes;
  return new Response(body, { status: range ? 206 : 200, headers });
}

async function serveNarration(
  request: Request,
  env: RuntimeEnv,
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

  if (relative.endsWith(".m4a") && env.ASSETS) {
    const asset = await env.ASSETS.fetch(request);
    if (asset.ok) {
      const headers = new Headers(asset.headers);
      headers.set("accept-ranges", "bytes");
      headers.set("cache-control", IMMUTABLE_CACHE);
      headers.set("content-type", "audio/mp4");
      headers.set("x-content-type-options", "nosniff");
      headers.set("x-knowing-word-media", "assets");
      return new Response(request.method === "HEAD" ? null : asset.body, {
        status: asset.status,
        statusText: asset.statusText,
        headers,
      });
    }
  }

  const mirrored = await mirrorNarrationToR2(request, env, objectKey, relative);
  if (mirrored) return mirrored;

  return new Response("Media not found", { status: 404 });
}

function withDeliveryCache(response: Response, pathname: string) {
  if (!response.ok) return response;
  const headers = new Headers(response.headers);
  if (pathname.startsWith("/assets/") || pathname.startsWith("/fonts/")) {
    headers.set("cache-control", IMMUTABLE_CACHE);
  } else if (
    pathname.startsWith("/illustrations/") ||
    pathname.startsWith("/heritage/") ||
    pathname.startsWith("/sfx/") ||
    pathname === "/og-cover.jpg"
  ) {
    headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
  } else {
    return response;
  }
  if (pathname.startsWith("/fonts/")) {
    headers.set("access-control-allow-origin", "*");
    headers.set("x-content-type-options", "nosniff");
    if (pathname.endsWith(".woff2")) headers.set("content-type", "font/woff2");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isDeliveryAsset(pathname: string) {
  return pathname.startsWith("/assets/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/illustrations/") ||
    pathname.startsWith("/heritage/") ||
    pathname.startsWith("/sfx/") ||
    pathname === "/og-cover.jpg";
}

const worker = {
  async fetch(request: Request, env: RuntimeEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === MINI_FONT_PATH) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
      }
      if (!env.ASSETS) return new Response("Font unavailable", { status: 503 });
      const assetUrl = new URL(MINI_FONT_ASSET_PATH, request.url);
      const asset = await env.ASSETS.fetch(new Request(assetUrl, { method: request.method }));
      if (!asset.ok) return new Response("Font unavailable", { status: asset.status });
      return withDeliveryCache(asset, MINI_FONT_ASSET_PATH);
    }

    const narrationPath = narrationRequestPath(url.pathname);
    if (narrationPath) {
      return serveNarration(request, env, narrationPath.version, narrationPath.relative);
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
