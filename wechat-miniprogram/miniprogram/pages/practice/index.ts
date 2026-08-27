import { getLessonContent, isCoreCharacter } from "../../services/catalog";
import { sendAnswerEvent } from "../../services/events";
import { navigationLayout } from "../../services/layout";
import { loadProfile, recordAnswer } from "../../services/profile";
import { masteryQuestionsFor } from "../../services/practice";
import type { CatalogCharacter, Exercise, TrackId } from "../../types/models";

const trackMeta: Record<TrackId, { title: string; eyebrow: string; copy: string }> = {
  words: { title: "完整识字", eyebrow: "字义 · 字形 · 结构 · 书写", copy: "围绕一个字连续完成整套练习。" },
  split: { title: "拆字复习", eyebrow: "把字拆开，再搭回来", copy: "重点观察部件的组成和位置。" },
  honglan: { title: "部首辨认", eyebrow: "表意部首与其他部件", copy: "用颜色和功能分清汉字部件。" },
  structure: { title: "结构复习", eyebrow: "像搭积木一样看汉字", copy: "先判断空间结构，再选择正确组合。" },
};

type ViewOption = Exercise["options"][number] & {
  state: string;
  image: string;
  label: string;
  structureClass: string;
  showParts: boolean;
};

type CelebrationPart = {
  char: string;
  tone: "radical" | "part";
  side: "from-left" | "from-right";
};

function structureClass(code = "") {
  if (code === "⿰") return "ss-side";
  if (code === "⿲") return "ss-triside";
  if (code === "⿱") return "ss-stack";
  if (code === "⿳") return "ss-tristack";
  if (code === "⿴") return "ss-enclose";
  if (code === "⿵") return "ss-open-top";
  if (code === "⿶") return "ss-open-bottom";
  if (code === "⿷") return "ss-open-right";
  if (code === "⿸") return "ss-corner-tl";
  if (code === "⿹") return "ss-corner-tr";
  if (code === "⿺") return "ss-corner-bl";
  if (code === "⿻") return "ss-cross";
  return "ss-single";
}

function questionsFor(character: CatalogCharacter, track: TrackId) {
  const exercises = character.exercises ?? [];
  if (track === "words") return masteryQuestionsFor(character);
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
    glyphChoices: false,
    structureChoices: false,
    isWriting: false,
    showWritingBoard: false,
    showPendingActions: false,
    answered: false,
    correct: false,
    resultCopy: "",
    finished: false,
    sessionResults: [] as boolean[],
    passedQuestionIds: [] as string[],
    streak: 0,
    currentAttempts: 0,
    questionMotion: "question-enter-a",
    celebrationParts: [] as CelebrationPart[],
    hasCelebrationParts: false,
    hasBothParts: false,
    radicalChar: "",
    shapeChar: "",
    shapeRole: "补充字形线索",
    celebrationLabel: "单字过关",
    firstTryRate: 100,
    perfect: true,
    nextActionLabel: "继续 · 下一个字",
    loading: true,
    error: "",
    progress: 0,
    questionLabel: "选择题",
    ready: false,
    navHeight: 52,
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
      ...navigationLayout(0),
    });
    void this.loadSession();
  },
  async loadSession() {
    try {
      const content = await getLessonContent(this.data.lessonId);
      const profile = loadProfile();
      const characters = content.characters.filter((character) => isCoreCharacter(character) && (character.exercises?.length ?? 0) > 0);
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
    const parts = character.parts?.length
      ? character.parts
      : [{ char: character.hanzi, radical: true }];
    const radical = parts.find((part) => part.radical);
    const shape = parts.find((part) => !part.radical);
    const celebrationLabel = this.data.track === "words"
      ? "单字过关"
      : this.data.trackInfo.title;
    this.setData({
      character,
      questions,
      questionIndex: 0,
      finished: false,
      sessionResults: [],
      passedQuestionIds: [],
      streak: 0,
      currentAttempts: 0,
      celebrationParts: parts.slice(0, 2).map((part, index) => ({
        char: part.char,
        tone: part.radical ? "radical" : "part",
        side: index === 0 ? "from-left" : "from-right",
      })),
      hasCelebrationParts: parts.length > 1,
      hasBothParts: Boolean(radical && shape),
      radicalChar: radical?.char ?? "",
      shapeChar: shape?.char ?? "",
      shapeRole: character.charType.includes("形声") ? "提供读音线索" : "补充字形线索",
      celebrationLabel,
      firstTryRate: 100,
      perfect: true,
      nextActionLabel: this.data.characterIndex < this.data.characters.length - 1
        ? "继续 · 下一个字"
        : "完成本课",
    });
    this.prepareQuestion();
  },
  prepareQuestion(preserveAttempts = false) {
    const question = this.data.questions[this.data.questionIndex];
    if (!question) {
      this.setData({ finished: true });
      return;
    }
    const correctCount = question.options.filter((option) => option.correct).length;
    const visuals = this.data.character?.media?.practiceOptionVisuals ?? {};
    const glyphChoices = question.kind !== "structure"
      && question.questionType !== "image_single_select"
      && question.options.length > 0
      && question.options.every((option) => Array.from(option.text ?? "").length === 1);
    this.setData({
      question,
      selectedIds: [],
      answered: false,
      correct: false,
      currentAttempts: preserveAttempts ? this.data.currentAttempts : 0,
      resultCopy: "",
      questionLabel: question.kind === "write" ? "书写自查" : question.kind === "structure" ? "结构题" : question.kind === "components" ? "部件题" : "选择题",
      multiChoice: correctCount > 1,
      glyphChoices,
      structureChoices: question.kind === "structure",
      isWriting: question.kind === "write",
      showWritingBoard: question.kind === "write" || question.options.length === 0,
      showPendingActions: question.kind !== "write",
      ready: false,
      progress: Math.round(this.data.questionIndex / this.data.questions.length * 100),
      questionMotion: this.data.questionMotion === "question-enter-a" ? "question-enter-b" : "question-enter-a",
      viewOptions: question.options.map((option, index) => ({
        ...option,
        label: String.fromCharCode(65 + index),
        state: "",
        image: visuals[`${question.id}:${option.id}`]?.src ?? "",
        structureClass: structureClass(option.idcCode),
        showParts: false,
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
      this.setData({ selectedIds, ready: selectedIds.length > 0, viewOptions: this.data.viewOptions.map((option) => ({ ...option, state: selectedIds.includes(option.id) ? "selected" : "" })) });
      return;
    }
    this.setData({
      selectedIds: [id],
      ready: true,
      viewOptions: this.data.viewOptions.map((option) => ({ ...option, state: option.id === id ? "selected" : "" })),
    });
  },
  checkAnswer() {
    if (!this.data.ready || !this.data.selectedIds.length) return;
    this.evaluate(this.data.selectedIds);
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
    const latencyMs = Date.now() - (this as unknown as { questionStartedAt: number }).questionStartedAt;
    const nextPassedQuestionIds = correct && !this.data.passedQuestionIds.includes(question.id)
      ? [...this.data.passedQuestionIds, question.id]
      : this.data.passedQuestionIds;
    recordAnswer({
      profile: loadProfile(),
      track: this.data.track,
      lessonId: this.data.lessonId,
      characterId: character.id,
      questionId: question.id,
      correct,
      questionIndex: this.data.questionIndex,
      completed: correct && nextPassedQuestionIds.length === this.data.questions.length,
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
    const sessionResults = [...this.data.sessionResults, correct];
    const streak = correct ? this.data.streak + 1 : 0;
    wx.vibrateShort({ type: correct ? "medium" : "light", fail: () => undefined });
    this.setData({
      answered: true,
      ready: false,
      showPendingActions: false,
      correct,
      progress: Math.round((correct ? this.data.questionIndex + 1 : this.data.questionIndex) / this.data.questions.length * 100),
      sessionResults,
      passedQuestionIds: nextPassedQuestionIds,
      streak,
      currentAttempts: this.data.currentAttempts + 1,
      firstTryRate: Math.min(100, Math.round(this.data.questions.length * 100 / Math.max(sessionResults.length, this.data.questions.length))),
      perfect: sessionResults.length === this.data.questions.length,
      resultCopy: correct ? (question.explanation || "记住这个线索，再去下一题。") : question.explanation || "再看一眼字形线索，然后继续。",
      viewOptions: this.data.viewOptions.map((option) => ({
        ...option,
        state: option.correct ? "correct" : selectedIds.includes(option.id) ? "wrong" : "",
        showParts: this.data.glyphChoices
          && option.correct
          && option.text === character.hanzi
          && (character.parts?.length ?? 0) > 1,
      })),
    });
  },
  nextQuestion() {
    if (!this.data.correct) {
      this.prepareQuestion(true);
      return;
    }
    if (this.data.passedQuestionIds.length >= this.data.questions.length) {
      this.setData({ finished: true });
      return;
    }
    const nextIndex = this.data.questions.findIndex((question, index) =>
      index > this.data.questionIndex && !this.data.passedQuestionIds.includes(question.id));
    const wrappedIndex = this.data.questions.findIndex((question) =>
      !this.data.passedQuestionIds.includes(question.id));
    this.setData({ questionIndex: nextIndex >= 0 ? nextIndex : wrappedIndex });
    this.prepareQuestion();
  },
  previousQuestion() {
    if (this.data.questionIndex === 0 || this.data.answered) return;
    this.setData({ questionIndex: this.data.questionIndex - 1 });
    this.prepareQuestion();
  },
  skipQuestion() {
    if (this.data.answered) return;
    const nextIndex = this.data.questions.findIndex((question, index) =>
      index > this.data.questionIndex && !this.data.passedQuestionIds.includes(question.id));
    const wrappedIndex = this.data.questions.findIndex((question, index) =>
      index !== this.data.questionIndex && !this.data.passedQuestionIds.includes(question.id));
    if (nextIndex < 0 && wrappedIndex < 0) {
      wx.showToast({ title: "这是最后一道待完成题", icon: "none" });
      return;
    }
    this.setData({ questionIndex: nextIndex >= 0 ? nextIndex : wrappedIndex });
    this.prepareQuestion();
  },
  replayCharacter() {
    this.setData({
      finished: false,
      questionIndex: 0,
      sessionResults: [],
      passedQuestionIds: [],
      streak: 0,
      currentAttempts: 0,
      firstTryRate: 100,
      perfect: true,
    });
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
  finishSession() { this.goBack(); },
  goBack() { wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/practice-hub/index" }) }); },
  retry() { this.setData({ error: "", loading: true }); void this.loadSession(); },
});
