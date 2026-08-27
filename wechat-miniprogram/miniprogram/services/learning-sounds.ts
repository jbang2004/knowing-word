export type LearningSoundId = "start" | "correct" | "streak" | "retry" | "encourage" | "complete" | "dailyComplete";

const soundUrls: Record<LearningSoundId, string> = {
  start: "https://knowing-word.jbang2004.chatgpt.site/sfx/start.mp3",
  correct: "https://knowing-word.jbang2004.chatgpt.site/sfx/correct.mp3",
  streak: "https://knowing-word.jbang2004.chatgpt.site/sfx/streak.mp3",
  retry: "https://knowing-word.jbang2004.chatgpt.site/sfx/retry.mp3",
  encourage: "https://knowing-word.jbang2004.chatgpt.site/sfx/encourage.mp3",
  complete: "https://knowing-word.jbang2004.chatgpt.site/sfx/complete.mp3",
  dailyComplete: "https://knowing-word.jbang2004.chatgpt.site/sfx/daily-complete.mp3",
};

let activeSound: WechatMiniprogram.InnerAudioContext | null = null;

export function playLearningSound(id: LearningSoundId) {
  activeSound?.destroy();
  const audio = wx.createInnerAudioContext({ useWebAudioImplement: true });
  activeSound = audio;
  audio.volume = 0.78;
  audio.autoplay = true;
  audio.src = soundUrls[id];
  const dispose = () => {
    if (activeSound === audio) activeSound = null;
    audio.destroy();
  };
  audio.onEnded(dispose);
  audio.onError(dispose);
}

export function stopLearningSound() {
  activeSound?.destroy();
  activeSound = null;
}
