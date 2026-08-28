export type NavigationLayout = {
  navTop: number;
  navHeight: number;
  capsuleInset: number;
  contentTop: number;
};

type SceneLayout = {
  windowWidth: number;
  windowHeight: number;
  navHeight: number;
  furnitureHeight: number;
};

/**
 * Give a square teaching image every pixel left after the real page furniture
 * is laid out. A small floor keeps it useful on short screens; the page's
 * compact media query is responsible for making that floor fit.
 */
export function fittedSceneSize(
  { windowWidth, windowHeight, navHeight, furnitureHeight }: SceneLayout,
) {
  const availableHeight = Math.floor(windowHeight - navHeight - furnitureHeight - 4);
  return Math.max(96, Math.min(520, windowWidth, availableHeight));
}

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
