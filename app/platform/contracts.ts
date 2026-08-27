export type PlatformRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  cache?: RequestCache;
  signal?: AbortSignal;
};

export interface KeyValueStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export interface JsonTransport {
  request<T>(path: string, options?: PlatformRequestOptions): Promise<T>;
}

export interface Connectivity {
  onOnline(listener: () => void): () => void;
}

export interface StorageEvents {
  onChange(key: string, listener: () => void): () => void;
}

export type CapturedAudio = {
  body: unknown;
  contentType: string;
  durationMs: number;
  localUrl: string;
  release: () => void;
};

export interface VoiceRecorder {
  start(onComplete: (capture: CapturedAudio) => void | Promise<void>): Promise<void>;
  stop(): void;
  dispose(): void;
}
