import { ensureWechatSession } from "./services/session";
import { ensureProfileActor, syncProfile } from "./services/profile";
import { flushLearningEvents } from "./services/events";

App({
  globalData: {
    sessionReady: false,
  },
  onLaunch() {
    // The first screen is fully usable from the bundled catalog and local
    // profile. WeChat login may be unavailable on a preview device before
    // request domains or server credentials are configured, so it must never
    // hold the initial render hostage.
    this.globalData.sessionReady = true;
    void ensureProfileActor();
    void ensureWechatSession().then(async () => {
      await syncProfile();
      await flushLearningEvents();
    });
  },
  onShow() {
    if (this.globalData.sessionReady) {
      void syncProfile().then(() => flushLearningEvents());
    }
  },
});
