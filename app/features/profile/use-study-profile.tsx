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
  mergeStudyProfiles,
  normalizeProfile,
  type StudyProfile,
} from "../../lib/profile-model";
import { webProfileClient } from "../../platform/web";
import type { AccountIdentity } from "../../application/profile-client";

export type { AccountIdentity } from "../../application/profile-client";

export type ProfileSyncState = "loading" | "synced" | "local";

type StudyProfileContextValue = {
  profile: StudyProfile;
  setProfile: Dispatch<SetStateAction<StudyProfile>>;
  identity: AccountIdentity | null;
  hydrated: boolean;
  syncState: ProfileSyncState;
  resetProfile: () => Promise<void>;
};

const StudyProfileContext = createContext<StudyProfileContextValue | null>(null);

export function StudyProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudyProfile>(webProfileClient.empty);
  const [identity, setIdentity] = useState<AccountIdentity | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<ProfileSyncState>("loading");
  const lastSaved = useRef(JSON.stringify(webProfileClient.empty()));
  const queuedSave = useRef<string | null>(null);
  const saveTask = useRef<Promise<void> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(true);

  const flushQueuedSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (saveTask.current) return saveTask.current;
    const task = (async () => {
      while (active.current && queuedSave.current) {
        const serialized = queuedSave.current;
        queuedSave.current = null;
        try {
          const authoritative = await webProfileClient.save(serialized);
          const authoritativeSerialized = JSON.stringify(authoritative);
          lastSaved.current = authoritativeSerialized;
          if (queuedSave.current) {
            const reconciled = mergeStudyProfiles(
              authoritative,
              JSON.parse(queuedSave.current),
            );
            const reconciledSerialized = JSON.stringify(reconciled);
            queuedSave.current = reconciledSerialized === authoritativeSerialized
              ? null
              : reconciledSerialized;
            if (active.current) setProfile(reconciled);
          } else if (authoritativeSerialized !== serialized && active.current) {
            setProfile(authoritative);
            webProfileClient.writeCache(authoritative);
          }
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

  const scheduleQueuedSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      void flushQueuedSave();
    }, 700);
  }, [flushQueuedSave]);

  useEffect(() => {
    active.current = true;
    const controller = new AbortController();
    const cached = webProfileClient.readCache();

    void (async () => {
      try {
        const payload = await webProfileClient.load(controller.signal);
        if (!active.current) return;
        if (payload.identity) setIdentity(payload.identity);
        const remote = payload.profile ? normalizeProfile(payload.profile) : null;
        const authoritative = remote && cached
          ? mergeStudyProfiles(remote, cached)
          : remote ?? cached ?? webProfileClient.empty();
        // Keep the actual remote snapshot here. If merging recovered newer
        // local evidence, the normal save effect will upload the merged result.
        lastSaved.current = JSON.stringify(remote ?? webProfileClient.empty());
        setProfile(authoritative);
        webProfileClient.writeCache(authoritative);
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
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = profile.theme;
    if (!hydrated) return;
    try {
      webProfileClient.writeCache(profile);
    } catch {
      // A denied or full local cache must not interrupt the authoritative
      // server save that follows this best-effort browser write.
    }
    const serialized = JSON.stringify(profile);
    if (serialized === lastSaved.current) return;
    queuedSave.current = serialized;
    scheduleQueuedSave();
  }, [hydrated, profile, scheduleQueuedSave]);

  useEffect(() => {
    return webProfileClient.onOnline(() => void flushQueuedSave());
  }, [flushQueuedSave]);

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") void flushQueuedSave();
    };
    window.addEventListener("pagehide", flushWhenHidden);
    document.addEventListener("visibilitychange", flushWhenHidden);
    return () => {
      window.removeEventListener("pagehide", flushWhenHidden);
      document.removeEventListener("visibilitychange", flushWhenHidden);
    };
  }, [flushQueuedSave]);

  const resetProfile = useCallback(async () => {
    const next = { ...webProfileClient.empty(), theme: profile.theme };
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    queuedSave.current = null;
    setSyncState("loading");
    try {
      await saveTask.current;
      queuedSave.current = null;
      await webProfileClient.reset();
      lastSaved.current = JSON.stringify(next);
      setSyncState("synced");
    } catch {
      setSyncState("local");
    } finally {
      webProfileClient.clearCache();
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
