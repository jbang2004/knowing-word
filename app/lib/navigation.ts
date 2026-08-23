export type PrimaryNavigationId = "home" | "course" | "practice" | "profile";

export const primaryNavigation: ReadonlyArray<{
  id: PrimaryNavigationId;
  label: string;
  href: string;
}> = [
  { id: "home", label: "学习", href: "/" },
  { id: "course", label: "课本", href: "/lessons" },
  { id: "practice", label: "练习", href: "/practice" },
  { id: "profile", label: "我的", href: "/account" },
];
