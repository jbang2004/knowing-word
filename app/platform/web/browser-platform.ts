import type {
  Connectivity,
  JsonTransport,
  KeyValueStorage,
  PlatformRequestOptions,
  StorageEvents,
} from "../contracts.ts";

export class PlatformRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PlatformRequestError";
  }
}

export const browserStorage: KeyValueStorage = {
  get(key) {
    return window.localStorage.getItem(key);
  },
  set(key, value) {
    window.localStorage.setItem(key, value);
  },
  remove(key) {
    window.localStorage.removeItem(key);
  },
};

function requestBody(body: unknown): BodyInit | null | undefined {
  if (body === undefined || body === null) return body;
  if (
    typeof body === "string"
    || body instanceof Blob
    || body instanceof FormData
    || body instanceof URLSearchParams
    || body instanceof ArrayBuffer
    || ArrayBuffer.isView(body)
    || body instanceof ReadableStream
  ) {
    return body as BodyInit;
  }
  throw new TypeError("The browser transport received an unsupported request body");
}

export const browserTransport: JsonTransport = {
  async request<T>(path: string, options: PlatformRequestOptions = {}) {
    const response = await fetch(path, {
      method: options.method,
      headers: options.headers,
      body: requestBody(options.body),
      cache: options.cache,
      signal: options.signal,
    });
    if (!response.ok) {
      throw new PlatformRequestError(`Request failed with status ${response.status}`, response.status);
    }
    return response.json() as Promise<T>;
  },
};

export const browserConnectivity: Connectivity = {
  onOnline(listener) {
    window.addEventListener("online", listener);
    return () => window.removeEventListener("online", listener);
  },
};

export const browserStorageEvents: StorageEvents = {
  onChange(key, listener) {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
};
