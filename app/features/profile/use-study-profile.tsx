"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
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

type StudyProfileContextValue = {
  profile: StudyProfile;
  setProfile: Dispatch<SetStateAction<StudyProfile>>;
  identity: AccountIdentity | null;
  hydrated: boolean;
  syncState: ProfileSyncState;
  resetProfile: () => Promise<void>;
};

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

const StudyProfileContext = createContext<StudyProfileContextValue | null>(null);

export function StudyProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudyProfile>(emptyProfile);
  const [identity, setIdentity] = useState<AccountIdentity | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<ProfileSyncState>("loading");
  const lastSaved = useRef(JSON.stringify(emptyProfile()));
  const queuedSave = useRef<string | null>(null);
  const saveTask = useRef<Promise<void> | null>(null);
  const active = useRef(true);

  const flushQueuedSave = useCallback(() => {
    if (saveTask.current) return saveTask.current;
    const task = (async () => {
      while (active.current && queuedSave.current) {
        const serialized = queuedSave.current;
        queuedSave.current = null;
        try {
          const response = await fetch("/api/profile", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: serialized,
          });
          if (!response.ok) throw new Error("profile save rejected");
          lastSaved.current = serialized;
          if (active.current) setSyncState("synced");
        } catch {
          // A queued profile is always the newest complete snapshot, so keep it
          // instead of restoring an older failed request over the top of it.
          if (!queuedSave.current) queuedSave.current = serialized;
          if (active.current) setSyncState("local");
          break;
        }
      }
    })().finally(() => {
      if (saveTask.current === task) saveTask.current = null;
    });
    saveTask.current = task;
    return task;
  }, []);

  useEffect(() => {
    active.current = true;
    const controller = new AbortController();
    const cached = readCachedProfile();

    void (async () => {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("profile unavailable");
        const payload = await response.json() as ProfileResponse;
        if (!active.current) return;
        if (payload.identity) setIdentity(payload.identity);
        const authoritative = payload.profile ? normalizeProfile(payload.profile) : cached ?? emptyProfile();
        lastSaved.current = payload.profile
          ? JSON.stringify(authoritative)
          : JSON.stringify(emptyProfile());
        setProfile(authoritative);
        cacheProfile(authoritative);
        setSyncState("synced");
      } catch {
        if (active.current) {
          if (cached) setProfile(cached);
          setSyncState("local");
        }
      } finally {
        if (active.current) setHydrated(true);
      }
    })();

    return () => {
      active.current = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = profile.theme;
    if (!hydrated) return;
    cacheProfile(profile);
    const serialized = JSON.stringify(profile);
    if (serialized === lastSaved.current) return;
    queuedSave.current = serialized;
    void flushQueuedSave();
  }, [flushQueuedSave, hydrated, profile]);

  useEffect(() => {
    const retryWhenOnline = () => void flushQueuedSave();
    window.addEventListener("online", retryWhenOnline);
    return () => window.removeEventListener("online", retryWhenOnline);
  }, [flushQueuedSave]);

  const resetProfile = useCallback(async () => {
    const next = { ...emptyProfile(), theme: profile.theme };
    queuedSave.current = null;
    setSyncState("loading");
    try {
      await saveTask.current;
      queuedSave.current = null;
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

  return (
    <StudyProfileContext.Provider value={{ profile, setProfile, identity, hydrated, syncState, resetProfile }}>
      {children}
    </StudyProfileContext.Provider>
  );
}

export function useStudyProfile(_options: { writable?: boolean } = {}): StudyProfileContextValue {
  void _options;
  const value = useContext(StudyProfileContext);
  if (!value) throw new Error("useStudyProfile must be used inside StudyProfileProvider");
  return value;
}
