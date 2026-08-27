import {
  LEGACY_PROFILE_STORAGE_KEYS,
  PROFILE_STORAGE_KEY,
  type StudyProfile,
} from "../lib/profile-model.ts";
import {
  combineProfileShards,
  partitionProfileForStorage,
  PROFILE_ANSWER_BUCKETS,
} from "../domain/profile-shards.ts";
import type { Connectivity, JsonTransport, KeyValueStorage } from "../platform/contracts.ts";

export type AccountIdentity = {
  displayName: string;
  email: string | null;
  mode: "workspace" | "device" | "wechat";
};

export type ProfileResponse = {
  identity?: AccountIdentity;
  profile?: unknown;
};

export type ProfileClient = ReturnType<typeof createProfileClient>;

export const PROFILE_BASE_CACHE_KEY = `${PROFILE_STORAGE_KEY}:base`;
export const PROFILE_ANSWER_CACHE_PREFIX = `${PROFILE_STORAGE_KEY}:answers:`;

export function createProfileClient({
  storage,
  transport,
  connectivity,
}: {
  storage: KeyValueStorage;
  transport: JsonTransport;
  connectivity: Connectivity;
}) {
  function clearCache() {
    storage.remove(PROFILE_STORAGE_KEY);
    storage.remove(PROFILE_BASE_CACHE_KEY);
    for (let bucket = 0; bucket < PROFILE_ANSWER_BUCKETS; bucket += 1) {
      storage.remove(`${PROFILE_ANSWER_CACHE_PREFIX}${bucket}`);
    }
    LEGACY_PROFILE_STORAGE_KEYS.forEach((key) => storage.remove(key));
  }

  return {
    readCache(): StudyProfile | null {
      try {
        const storedBase = storage.get(PROFILE_BASE_CACHE_KEY);
        if (storedBase) {
          const shards = Array.from({ length: PROFILE_ANSWER_BUCKETS }, (_, bucket) => {
            const value = storage.get(`${PROFILE_ANSWER_CACHE_PREFIX}${bucket}`);
            return value ? JSON.parse(value) : {};
          });
          return combineProfileShards(JSON.parse(storedBase), shards);
        }
        const stored = storage.get(PROFILE_STORAGE_KEY)
          ?? LEGACY_PROFILE_STORAGE_KEYS
            .map((key) => storage.get(key))
            .find((value) => value !== null);
        return stored ? combineProfileShards(JSON.parse(stored), []) : null;
      } catch {
        clearCache();
        return null;
      }
    },

    writeCache(profile: StudyProfile) {
      const { base, shards } = partitionProfileForStorage(profile);
      storage.set(PROFILE_BASE_CACHE_KEY, JSON.stringify(base));
      shards.forEach((answers, bucket) => {
        storage.set(`${PROFILE_ANSWER_CACHE_PREFIX}${bucket}`, JSON.stringify(answers));
      });
      storage.remove(PROFILE_STORAGE_KEY);
      LEGACY_PROFILE_STORAGE_KEYS.forEach((key) => storage.remove(key));
    },

    clearCache,

    load(signal?: AbortSignal) {
      return transport.request<ProfileResponse>("/api/profile", {
        cache: "no-store",
        signal,
      });
    },

    async save(serializedProfile: string) {
      const payload = await transport.request<{ profile?: unknown }>("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: serializedProfile,
      });
      return payload.profile
        ? combineProfileShards(payload.profile, [])
        : combineProfileShards(JSON.parse(serializedProfile), []);
    },

    reset() {
      return transport.request<{ ok: true }>("/api/profile", { method: "DELETE" });
    },

    onOnline(listener: () => void) {
      return connectivity.onOnline(listener);
    },

    empty: () => combineProfileShards({}, []),
  };
}
