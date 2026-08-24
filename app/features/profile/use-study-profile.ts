"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  emptyProfile,
  LEGACY_PROFILE_STORAGE_KEYS,
  normalizeProfile,
  PROFILE_STORAGE_KEY,
  type StudyProfile,
} from "../../lib/profile-model";

export type AccountIdentity = {
  displayName: string;
  email: string | null;
  mode: "workspace" | "device";
};

export type ProfileSyncState = "loading" | "synced" | "local";

type ProfileResponse = {
  identity?: AccountIdentity;
  profile?: unknown;
};

function readCachedProfile() {
  try {
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY)
      ?? LEGACY_PROFILE_STORAGE_KEYS
        .map((key) => window.localStorage.getItem(key))
        .find((value) => value !== null);
    return stored ? normalizeProfile(JSON.parse(stored)) : null;
  } catch {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    LEGACY_PROFILE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    return null;
  }
}

function cacheProfile(profile: StudyProfile) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  LEGACY_PROFILE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

export function useStudyProfile({ writable = true }: { writable?: boolean } = {}): {
  profile: StudyProfile;
  setProfile: Dispatch<SetStateAction<StudyProfile>>;
  identity: AccountIdentity | null;
  hydrated: boolean;
  syncState: ProfileSyncState;
  resetProfile: () => Promise<void>;
} {
  const [profile, setProfile] = useState<StudyProfile>(emptyProfile);
  const [identity, setIdentity] = useState<AccountIdentity | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<ProfileSyncState>("loading");
  const [retry, setRetry] = useState(0);
  const lastSaved = useRef(JSON.stringify(emptyProfile()));

  useEffect(() => {
    let active = true;
    const cached = readCachedProfile();
    const cacheTimer = cached
      ? window.setTimeout(() => {
          if (active) setProfile(cached);
        }, 0)
      : undefined;

    void (async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (!response.ok) throw new Error("profile unavailable");
        const payload = await response.json() as ProfileResponse;
        if (!active) return;
        if (cacheTimer !== undefined) window.clearTimeout(cacheTimer);
        if (payload.identity) setIdentity(payload.identity);
        const authoritative = payload.profile ? normalizeProfile(payload.profile) : emptyProfile();
        lastSaved.current = JSON.stringify(authoritative);
        setProfile(authoritative);
        cacheProfile(authoritative);
        setSyncState("synced");
      } catch {
        if (active) setSyncState("local");
      } finally {
        if (active) setHydrated(true);
      }
    })();

    return () => {
      active = false;
      if (cacheTimer !== undefined) window.clearTimeout(cacheTimer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = profile.theme;
    if (!hydrated) return;
    cacheProfile(profile);
  }, [hydrated, profile]);

  useEffect(() => {
    const retryWhenOnline = () => setRetry((value) => value + 1);
    window.addEventListener("online", retryWhenOnline);
    return () => window.removeEventListener("online", retryWhenOnline);
  }, []);

  useEffect(() => {
    if (!writable || !hydrated) return;
    const serialized = JSON.stringify(profile);
    if (serialized === lastSaved.current) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: serialized,
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("profile save rejected");
        lastSaved.current = serialized;
        setSyncState("synced");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSyncState("local");
        }
      }
    }, 650);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [hydrated, profile, retry, writable]);

  const resetProfile = useCallback(async () => {
    const next = { ...emptyProfile(), theme: profile.theme };
    setSyncState("loading");
    try {
      const response = await fetch("/api/profile", { method: "DELETE" });
      if (!response.ok) throw new Error("profile reset rejected");
      lastSaved.current = JSON.stringify(next);
      setSyncState("synced");
    } catch {
      setSyncState("local");
    } finally {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      LEGACY_PROFILE_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
      setProfile(next);
    }
  }, [profile.theme]);

  return { profile, setProfile, identity, hydrated, syncState, resetProfile };
}
