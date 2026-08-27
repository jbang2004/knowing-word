import { ensureWechatSession } from "./services/session";
import { syncProfile } from "./services/profile";

App({
  globalData: {
    sessionReady: false,
  },
  async onLaunch() {
    await ensureWechatSession();
    this.globalData.sessionReady = true;
    await syncProfile();
  },
  onShow() {
    if (this.globalData.sessionReady) void syncProfile();
  },
});
