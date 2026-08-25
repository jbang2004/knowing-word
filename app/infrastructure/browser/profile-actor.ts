"use client";

const ACTOR_PATTERN = /^[a-zA-Z0-9_-]{1,32}$/;
let pageActorId: string | null = null;

export function getProfileActorId() {
  // A module instance belongs to one browser page realm. Keeping the replica
  // id in memory prevents duplicated tabs from inheriting the same id through
  // cloned sessionStorage and collapsing concurrent counter increments.
  if (pageActorId && ACTOR_PATTERN.test(pageActorId)) return pageActorId;
  pageActorId = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  return pageActorId;
}
