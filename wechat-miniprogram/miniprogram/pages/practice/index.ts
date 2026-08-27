import { getLessonContent } from "../../services/catalog";
import { sendAnswerEvent } from "../../services/events";
import { loadProfile, recordAnswer } from "../../services/profile";
import type { CatalogCharacter, Exercise, TrackId } from "../../types/models";

const trackMeta: Record<TrackId, { title: string; eyebrow: string; copy: string }> = {
  words: { title: "完整识字", eyebrow: "字义 · 字形 · 结构 · 书写", copy: "围绕一个字连续完成整套练习。" },
  split: { title: "拆字复习", eyebrow: "把字拆开，再搭回来", copy: "重点观察部件的组成和位置。" },
  honglan: { title: "部首辨认", eyebrow: "表意部首与其他部件", copy: "用颜色和功能分清汉字部件。" },
  structure: { title: "结构复习", eyebrow: "像搭积木一样看汉字", copy: "先判断空间结构，再选择正确组合。" },
};

type ViewOption = Exercise["options"][number] & { state: string; image: string; label: string };

function questionsFor(character: CatalogCharacter, track: TrackId) {
  const exercises = character.exercises ?? [];
  if (track === "words") return exercises;
  const selected = exercises.filter((exercise) => {
    const text = `${exercise.questionType}${exercise.prompt}${exercise.origin}`;
    if (track === "split") return exercise.kind === "components" || /拆|部件/u.test(text);
    if (track === "honglan") return exercise.options.some((option) => option.radical) || /部首|表意/u.test(text);
    return exercise.kind === "structure" || /结构|空间/u.test(text);
  });
  return selected.length ? selected : exercises.slice(0, Math.min(4, exercises.length));
}

Page({
  data: {
    track: "words" as TrackId,
    trackInfo: trackMeta.words,
    lessonId: "",
    requestedCharacterId: "",
    characters: [] as CatalogCharacter[],
    characterIndex: 0,
    character: null as CatalogCharacter | null,
    questions: [] as Exercise[],
    questionIndex: 0,
    question: null as Exercise | null,
    viewOptions: [] as ViewOption[],
    selectedIds: [] as string[],
    multiChoice: false,
    showMultiSubmit: false,
    answered: false,
    correct: false,
    resultCopy: "",
    finished: false,
    loading: true,
    error: "",
    progress: 0,
  },
  onLoad(options: Record<string, string | undefined>) {
    const track = ["words", "split", "honglan", "structure"].includes(options.track ?? "")
      ? options.track as TrackId
      : "words";
    this.setData({
      track,
      trackInfo: trackMeta[track],
      lessonId: options.lessonId ?? "g5v1-l01",
      requestedCharacterId: options.characterId ?? "",
    });
    wx.setNavigationBarTitle({ title: trackMeta[track].title });
    void this.loadSession();
  },
  async loadSession() {
    try {
      const content = await getLessonContent(this.data.lessonId);
      const profile = loadProfile();
      const characters = content.characters.filter((character) => character.ready && (character.exercises?.length ?? 0) > 0);
      let characterIndex = this.data.requestedCharacterId
        ? characters.findIndex((character) => character.id === this.data.requestedCharacterId)
        : characters.findIndex((character) => !profile.completed[this.data.track].includes(character.id));
      if (characterIndex < 0) characterIndex = 0;
      this.setData({ characters, characterIndex, loading: false });
      this.prepareCharacter();
    } catch (error) {
      this.setData({ loading: false, error: error instanceof Error ? error.message : "练习加载失败" });
    }
  },
  prepareCharacter() {
    const character = this.data.characters[this.data.characterIndex];
    if (!character) {
      this.setData({ finished: true });
      return;
    }
    const questions = questionsFor(character, this.data.track);
    this.setData({ character, questions, questionIndex: 0, finished: false });
    this.prepareQuestion();
  },
  prepareQuestion() {
    const question = this.data.questions[this.data.questionIndex];
    if (!question) {
      this.setData({ finished: true });
      return;
    }
    const correctCount = question.options.filter((option) => option.correct).length;
    const visuals = this.data.character?.media?.practiceOptionVisuals ?? {};
    this.setData({
      question,
      selectedIds: [],
      answered: false,
      correct: false,
      resultCopy: "",
      multiChoice: correctCount > 1,
      showMultiSubmit: correctCount > 1,
      progress: Math.round((this.data.questionIndex + 1) / this.data.questions.length * 100),
      viewOptions: question.options.map((option, index) => ({
        ...option,
        label: String.fromCharCode(65 + index),
        state: "",
        image: visuals[`${question.id}:${option.id}`]?.src ?? "",
      })),
    });
    (this as unknown as { questionStartedAt: number }).questionStartedAt = Date.now();
  },
  chooseOption(event: WechatMiniprogram.BaseEvent) {
    if (this.data.answered) return;
    const id = event.currentTarget.dataset.id as string;
    if (this.data.multiChoice) {
      const selectedIds = this.data.selectedIds.includes(id)
        ? this.data.selectedIds.filter((item) => item !== id)
        : [...this.data.selectedIds, id];
      this.setData({ selectedIds, viewOptions: this.data.viewOptions.map((option) => ({ ...option, state: selectedIds.includes(option.id) ? "selected" : "" })) });
      return;
    }
    this.evaluate([id]);
  },
  submitMulti() {
    if (!this.data.selectedIds.length) {
      wx.showToast({ title: "请先选择部件", icon: "none" });
      return;
    }
    this.evaluate(this.data.selectedIds);
  },
  selfAssess(event: WechatMiniprogram.BaseEvent) {
    this.evaluate([], event.currentTarget.dataset.correct === true || event.currentTarget.dataset.correct === "true");
  },
  evaluate(selectedIds: string[], selfCorrect?: boolean) {
    const question = this.data.question;
    const character = this.data.character;
    if (!question || !character || this.data.answered) return;
    const correctIds = question.options.filter((option) => option.correct).map((option) => option.id).sort();
    const correct = typeof selfCorrect === "boolean"
      ? selfCorrect
      : JSON.stringify([...selectedIds].sort()) === JSON.stringify(correctIds);
    const isFinal = this.data.questionIndex === this.data.questions.length - 1;
    const latencyMs = Date.now() - (this as unknown as { questionStartedAt: number }).questionStartedAt;
    recordAnswer({
      profile: loadProfile(),
      track: this.data.track,
      lessonId: this.data.lessonId,
      characterId: character.id,
      questionId: question.id,
      correct,
      questionIndex: this.data.questionIndex,
      completed: isFinal,
    });
    sendAnswerEvent({
      track: this.data.track,
      lessonId: this.data.lessonId,
      characterId: character.id,
      questionId: question.id,
      correct,
      selected: selectedIds,
      dimension: question.dimension,
      answerMode: question.answerMode ?? (question.kind === "write" ? "self-check" : "choice"),
      cueLevel: question.cueLevel ?? 0,
      latencyMs,
    });
    this.setData({
      answered: true,
      showMultiSubmit: false,
      correct,
      resultCopy: correct ? "判断准确。把这条线索收进记忆里。" : question.explanation || "再看一眼字形线索，然后继续。",
      viewOptions: this.data.viewOptions.map((option) => ({
        ...option,
        state: option.correct ? "correct" : selectedIds.includes(option.id) ? "wrong" : "",
      })),
    });
  },
  nextQuestion() {
    if (this.data.questionIndex >= this.data.questions.length - 1) {
      this.setData({ finished: true });
      return;
    }
    this.setData({ questionIndex: this.data.questionIndex + 1 });
    this.prepareQuestion();
  },
  nextCharacter() {
    if (this.data.characterIndex >= this.data.characters.length - 1) {
      wx.showToast({ title: "本课练习已完成", icon: "success" });
      setTimeout(() => wx.navigateBack(), 600);
      return;
    }
    this.setData({ characterIndex: this.data.characterIndex + 1 });
    this.prepareCharacter();
  },
  viewCard() {
    const character = this.data.character;
    if (!character) return;
    wx.navigateTo({ url: `/pages/character/index?lessonId=${this.data.lessonId}&characterId=${character.id}` });
  },
  retry() { this.setData({ error: "", loading: true }); void this.loadSession(); },
});
