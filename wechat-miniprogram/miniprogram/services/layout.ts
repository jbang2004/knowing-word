export type NavigationLayout = {
  navTop: number;
  navHeight: number;
  capsuleInset: number;
  contentTop: number;
};

/**
 * One source of truth for custom-navigation pages.
 *
 * WeChat's status bar and capsule are native chrome, so application content
 * starts below them. Every page uses the same 52px navigation row and the
 * same 18px breathing room as the phone layout on the Web site.
 */
export function navigationLayout(extra = 18): NavigationLayout {
  const menu = wx.getMenuButtonBoundingClientRect();
  const info = wx.getWindowInfo();
  const navTop = Math.max(info.statusBarHeight ?? 0, menu.top || 0);
  const navHeight = navTop + 52;
  return {
    navTop,
    navHeight,
    capsuleInset: Math.max(0, info.windowWidth - menu.left + 8),
    contentTop: navHeight + extra,
  };
}
