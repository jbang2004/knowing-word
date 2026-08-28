import { getLessonContent, isCoreCharacter } from "../../services/catalog";
import { sendAnswerEvent } from "../../services/events";
import { navigationLayout } from "../../services/layout";
import { playLearningSound, stopLearningSound } from "../../services/learning-sounds";
import { loadProfile, recordAnswer } from "../../services/profile";
import { masteryStepsFor, type PracticeStep } from "../../services/practice";
import type { CatalogCharacter, Exercise, TrackId } from "../../types/models";

let writingContext: WechatMiniprogram.CanvasContext | null = null;

const trackMeta: Record<TrackId, { title: string; eyebrow: string; copy: string }> = {
  words: { title: "完整识字", eyebrow: "字义 · 字形 · 结构 · 书写", copy: "围绕一个字连续完成整套练习。" },
  split: { title: "拆字复习", eyebrow: "把字拆开，再搭回来", copy: "重点观察部件的组成和位置。" },
  honglan: { title: "部首辨认", eyebrow: "表意部首与其他部件", copy: "用颜色和功能分清汉字部件。" },
  structure: { title: "结构复习", eyebrow: "像搭积木一样看汉字", copy: "先判断空间结构，再选择正确组合。" },
};

type ViewOption = Exercise["options"][number] & {
  state: string;
  image: string;
  visualLabel: string;
  label: string;
  structureClass: string;
  showParts: boolean;
  showMnemonicFocus: boolean;
};

type AssemblySlot = {
  key: number;
  id: string;
  text: string;
  state: string;
  pressClass: string;
  hoverClass: string;
};

type CelebrationPart = {
  key: string;
  char: string;
  tone: "radical" | "part";
  side: "from-left" | "from-right";
};

function writingRemediation(assessment = "") {
  if (assessment === "component-error") return { title: "重新搭一次字形", cue: "部件没有排对", instruction: "看清缺少或多出的部件，说出结构后，收起答案重新写一遍。" };
  if (assessment === "position-error") return { title: "看清部件位置", cue: "部件位置差了一点", instruction: "先说出左右、上下或包围关系，再按正确位置重新写一遍。" };
  return { title: "只改错的笔画", cue: "笔画差了一点", instruction: "找出漏笔或多笔，沿正确字形空书一次，然后遮住范字重新写。" };
}

function remediationFor(question: Exercise, track: TrackId) {
  if (question.kind === "structure") return { cue: "部件位置差了一点", instruction: "只比较部件的位置关系，说出结构后再选一次。" };
  if (track === "honglan") return { cue: "看管意思的那个部件", instruction: "找出提示意义类别的部件，说出它为什么适合这个词义，再重新选择。" };
  if (track === "split" || question.kind === "components") return { cue: "部件没有排对", instruction: "看清缺少、多出或放错位置的部件，说出结构后重新组合。" };
  if (question.dimension === "phonology") return { cue: "读音差了一点", instruction: "对照声母、韵母和声调，跟读一次常用词，再遮住拼音独立读。" };
  if (question.dimension === "semantics") return { cue: "先想想它是什么意思", instruction: "先说出熟悉词语的大意，再遮住答案，用这个字重新组一个词。" };
  if (question.dimension === "context") return { cue: "放回句子里再看看", instruction: "先读完整句意，再用字义和搭配排除不合适的字。" };
  return { cue: "两个字差在一个部件", instruction: "只比较不同的部件或位置，说出差别，再遮住答案重新辨认。" };
}

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

function stableOptionOrder(options: Exercise["options"], seed: string) {
  let state = Array.from(seed).reduce(
    (value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0,
    2166136261,
  );
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const ordered = [...options];
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]];
  }
  return ordered;
}

function expectedAnswerIds(question: Exercise, character: CatalogCharacter, track: TrackId) {
  if (track === "split" && question.kind === "components") {
    const ordered = (character.parts ?? [])
      .map((part) => question.options.find((option) => option.correct && option.text === part.char)?.id)
      .filter((id): id is string => Boolean(id));
    if (ordered.length) return ordered;
  }
  return question.options.filter((option) => option.correct).map((option) => option.id);
}

function assemblySlots(
  question: Exercise,
  character: CatalogCharacter,
  expectedIds: string[],
  selectedIds: string[],
  answered: boolean,
) {
  const count = Math.max(expectedIds.length, character.parts?.length ?? 0, 1);
  return Array.from({ length: count }, (_, index): AssemblySlot => {
    const id = selectedIds[index] ?? "";
    const option = question.options.find((item) => item.id === id);
    return {
      key: index,
      id,
      text: option?.text || "？",
      state: answered && option ? (expectedIds[index] === option.id ? "is-correct" : "is-wrong") : "",
      pressClass: id && !answered ? "press-card" : "",
      hoverClass: id && !answered ? "is-pressed" : "none",
    };
  });
}

function questionsFor(character: CatalogCharacter, track: TrackId) {
  const exercises = character.exercises ?? [];
  if (track === "words") return masteryStepsFor(character);
  const selected = exercises.filter((exercise) => {
    const text = `${exercise.questionType}${exercise.prompt}${exercise.origin}`;
    if (track === "split") return exercise.kind === "components" || /拆|部件/u.test(text);
    if (track === "honglan") return exercise.options.some((option) => option.radical) || /部首|表意/u.test(text);
    return exercise.kind === "structure" || /结构|空间/u.test(text);
  });
  return (selected.length ? selected : exercises.slice(0, Math.min(4, exercises.length)))
    .map((exercise): PracticeStep => ({ exercise, track }));
}

Page({
  data: {
    theme: loadProfile().theme,
    track: "words" as TrackId,
    trackInfo: trackMeta.words,
    lessonId: "",
    requestedCharacterId: "",
    characters: [] as CatalogCharacter[],
    characterIndex: 0,
    character: null as CatalogCharacter | null,
    questions: [] as PracticeStep[],
    questionIndex: 0,
    question: null as Exercise | null,
    questionTrack: "words" as TrackId,
    viewOptions: [] as ViewOption[],
    selectedIds: [] as string[],
    multiChoice: false,
    glyphChoices: false,
    visualChoices: false,
    hideVisualCaptions: false,
    structureChoices: false,
    splitAssembly: false,
    redBlueExercise: false,
    expectedIds: [] as string[],
    expectedCount: 0,
    assemblySlots: [] as AssemblySlot[],
    isWriting: false,
    showWritingBoard: false,
    writingReview: false,
    writingRewrite: false,
    showWritingRemediation: false,
    independentWriting: false,
    strokeCount: 0,
    showPendingActions: false,
    answered: false,
    correct: false,
    resultCopy: "",
    resultAnswer: "",
    resultAnswerIsGlyph: false,
    resultTitle: "",
    resultNote: "",
    remediationTitle: "",
    remediationNote: "",
    finished: false,
    sessionResults: [] as boolean[],
    passedQuestionIds: [] as string[],
    streak: 0,
    streakMotion: "streak-a",
    currentAttempts: 0,
    questionMotion: "question-enter-a",
    sessionSalt: `${Date.now()}-${Math.random()}`,
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
    navTop: 0,
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
  onUnload() {
    stopLearningSound();
  },
  async loadSession() {
    try {
      const content = await getLessonContent(this.data.lessonId);
      const profile = loadProfile();
      const learned = new Set(profile.completed.words);
      const characters = content.characters.filter((character) =>
        isCoreCharacter(character)
        && (character.exercises?.length ?? 0) > 0
        && (this.data.track === "words" || learned.has(character.id))
      );
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
    const sessionSalt = `${Date.now()}-${Math.random()}`;
    this.setData({
      character,
      questions,
      questionIndex: 0,
      finished: false,
      sessionResults: [],
      passedQuestionIds: [],
      streak: 0,
      currentAttempts: 0,
      sessionSalt,
      celebrationParts: parts.slice(0, 2).map((part, index) => ({
        key: `${part.char}-${index}-${sessionSalt}`,
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
    const step = this.data.questions[this.data.questionIndex];
    if (!step) {
      this.setData({ finished: true });
      return;
    }
    const question = step.exercise;
    const questionTrack = step.track;
    const correctCount = question.options.filter((option) => option.correct).length;
    const expectedIds = expectedAnswerIds(question, this.data.character!, questionTrack);
    const splitAssembly = question.kind === "components" && questionTrack === "split";
    const redBlueExercise = question.kind === "components" && questionTrack === "honglan";
    const visuals = this.data.character?.media?.practiceOptionVisuals ?? {};
    const orderedOptions = question.kind === "write"
      ? []
      : stableOptionOrder(question.options, `${question.id}:${this.data.sessionSalt}`);
    const glyphChoices = question.kind !== "structure"
      && question.questionType !== "image_single_select"
      && question.options.length > 0
      && question.options.every((option) => Array.from(option.text ?? "").length === 1);
    this.setData({
      question,
      questionTrack,
      selectedIds: [],
      answered: false,
      writingReview: false,
      writingRewrite: false,
      showWritingRemediation: false,
      independentWriting: question.kind === "write" && question.concealTarget === true,
      strokeCount: 0,
      correct: false,
      currentAttempts: preserveAttempts ? this.data.currentAttempts : 0,
      resultCopy: "",
      resultAnswer: "",
      resultAnswerIsGlyph: false,
      resultTitle: "",
      resultNote: "",
      remediationTitle: "",
      remediationNote: "",
      questionLabel: question.kind === "write" ? "独立书写" : questionTrack === "honglan" ? "红蓝字" : questionTrack === "split" || question.kind === "components" ? "组字 · 选字" : question.kind === "structure" ? "结构选择" : question.questionType === "image_single_select" ? "看图选择" : "选择题",
      multiChoice: correctCount > 1,
      glyphChoices,
      visualChoices: question.questionType === "image_single_select",
      hideVisualCaptions: question.questionType === "image_single_select",
      structureChoices: question.kind === "structure",
      splitAssembly,
      redBlueExercise,
      expectedIds,
      expectedCount: expectedIds.length,
      assemblySlots: assemblySlots(question, this.data.character!, expectedIds, [], false),
      isWriting: question.kind === "write",
      showWritingBoard: question.kind === "write" || question.options.length === 0,
      showPendingActions: true,
      ready: false,
      progress: Math.round(this.data.questionIndex / this.data.questions.length * 100),
      questionMotion: this.data.questionMotion === "question-enter-a" ? "question-enter-b" : "question-enter-a",
      viewOptions: orderedOptions.map((option, index) => ({
        ...option,
        label: String.fromCharCode(65 + index),
        state: "",
        image: visuals[`${question.id}:${option.id}`]?.src ?? "",
        visualLabel: visuals[`${question.id}:${option.id}`]?.label ?? option.text,
        structureClass: structureClass(option.idcCode),
        showParts: false,
        showMnemonicFocus: false,
      })),
    });
    (this as unknown as { questionStartedAt: number }).questionStartedAt = Date.now();
    if (question.kind === "write") {
      wx.nextTick(() => {
        writingContext = wx.createCanvasContext("writingCanvas", this);
        writingContext.clearRect(0, 0, 640, 640);
        writingContext.draw();
      });
    }
  },
  chooseOption(event: WechatMiniprogram.BaseEvent) {
    if (this.data.answered) return;
    const id = event.currentTarget.dataset.id as string;
    if (this.data.splitAssembly) {
      const allowedCopies = Math.max(1, this.data.expectedIds.filter((item) => item === id).length);
      const selectedCopies = this.data.selectedIds.filter((item) => item === id).length;
      if (selectedCopies >= allowedCopies) return;
      const selectedIds = [...this.data.selectedIds, id];
      this.setData({
        selectedIds,
        ready: selectedIds.length > 0,
        assemblySlots: assemblySlots(this.data.question!, this.data.character!, this.data.expectedIds, selectedIds, false),
        viewOptions: this.data.viewOptions.map((option) => ({ ...option, state: selectedIds.includes(option.id) ? "is-picked" : "" })),
      });
      return;
    }
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
  removeAssemblyPart(event: WechatMiniprogram.BaseEvent) {
    if (this.data.answered || !this.data.splitAssembly) return;
    const index = Number(event.currentTarget.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= this.data.selectedIds.length) return;
    const selectedIds = this.data.selectedIds.filter((_, itemIndex) => itemIndex !== index);
    this.setData({
      selectedIds,
      ready: selectedIds.length > 0,
      assemblySlots: assemblySlots(this.data.question!, this.data.character!, this.data.expectedIds, selectedIds, false),
      viewOptions: this.data.viewOptions.map((option) => ({ ...option, state: selectedIds.includes(option.id) ? "is-picked" : "" })),
    });
  },
  checkAnswer() {
    if (this.data.isWriting) {
      if (!this.data.ready) return;
      this.setData({ writingReview: true, showPendingActions: false });
      return;
    }
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
    this.setData({ writingReview: false });
    const assessment = event.currentTarget.dataset.assessment as string;
    this.evaluate([], assessment === "correct", assessment === "correct", assessment);
  },
  startWriting(event: WechatMiniprogram.TouchEvent) {
    if (this.data.writingReview || this.data.answered) return;
    const touch = event.touches[0] as unknown as { x?: number; y?: number; clientX: number; clientY: number };
    const point = { x: touch.x ?? touch.clientX, y: touch.y ?? touch.clientY };
    (this as unknown as { writingPoint: typeof point; writingLength: number; writingActive: boolean }).writingPoint = point;
    (this as unknown as { writingPoint: typeof point; writingLength: number; writingActive: boolean }).writingLength = 0;
    (this as unknown as { writingPoint: typeof point; writingLength: number; writingActive: boolean }).writingActive = true;
  },
  moveWriting(event: WechatMiniprogram.TouchEvent) {
    const state = this as unknown as { writingPoint?: { x: number; y: number }; writingLength?: number; writingActive?: boolean };
    if (!state.writingActive || !state.writingPoint || !writingContext) return;
    const touch = event.touches[0] as unknown as { x?: number; y?: number; clientX: number; clientY: number };
    const point = { x: touch.x ?? touch.clientX, y: touch.y ?? touch.clientY };
    state.writingLength = (state.writingLength ?? 0) + Math.hypot(point.x - state.writingPoint.x, point.y - state.writingPoint.y);
    writingContext.beginPath();
    writingContext.setStrokeStyle("#263b64");
    writingContext.setLineWidth(5);
    writingContext.setLineCap("round");
    writingContext.setLineJoin("round");
    writingContext.moveTo(state.writingPoint.x, state.writingPoint.y);
    writingContext.lineTo(point.x, point.y);
    writingContext.stroke();
    writingContext.draw(true);
    state.writingPoint = point;
  },
  endWriting() {
    const state = this as unknown as { writingPoint?: { x: number; y: number }; writingLength?: number; writingActive?: boolean };
    if (state.writingActive && (state.writingLength ?? 0) >= 7) {
      this.setData({ strokeCount: this.data.strokeCount + 1, ready: true });
    }
    state.writingActive = false;
    state.writingPoint = undefined;
    state.writingLength = 0;
  },
  clearWriting() {
    writingContext?.clearRect(0, 0, 640, 640);
    writingContext?.draw();
    this.setData({ strokeCount: 0, ready: false });
  },
  evaluate(selectedIds: string[], selfCorrect?: boolean, showResult = true, writingAssessment = "") {
    const question = this.data.question;
    const character = this.data.character;
    if (!question || !character || this.data.answered) return;
    const correctIds = expectedAnswerIds(question, character, this.data.questionTrack);
    const correct = typeof selfCorrect === "boolean"
      ? selfCorrect
      : this.data.splitAssembly
        ? correctIds.length === selectedIds.length && correctIds.every((id, index) => selectedIds[index] === id)
        : JSON.stringify([...selectedIds].sort()) === JSON.stringify([...correctIds].sort());
    const latencyMs = Date.now() - (this as unknown as { questionStartedAt: number }).questionStartedAt;
    const nextPassedQuestionIds = correct && !this.data.passedQuestionIds.includes(question.id)
      ? [...this.data.passedQuestionIds, question.id]
      : this.data.passedQuestionIds;
    recordAnswer({
      profile: loadProfile(),
      track: this.data.questionTrack,
      lessonId: this.data.lessonId,
      characterId: character.id,
      questionId: question.id,
      correct,
      questionIndex: this.data.questionIndex,
      completed: correct && nextPassedQuestionIds.length === this.data.questions.length,
    });
    sendAnswerEvent({
      track: this.data.questionTrack,
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
    playLearningSound(correct ? (streak >= 3 ? "streak" : "correct") : "retry");
    wx.vibrateShort({ type: correct ? "light" : "medium", fail: () => undefined });
    if (!showResult && question.kind === "write") {
      const remediation = writingRemediation(writingAssessment);
      this.setData({
        answered: false,
        ready: false,
        writingReview: false,
        writingRewrite: true,
        showWritingRemediation: true,
        showPendingActions: true,
        strokeCount: 0,
        correct: false,
        sessionResults,
        passedQuestionIds: nextPassedQuestionIds,
        streak: 0,
        currentAttempts: this.data.currentAttempts + 1,
        firstTryRate: Math.min(100, Math.round(this.data.questions.length * 100 / Math.max(sessionResults.length, this.data.questions.length))),
        perfect: false,
        remediationTitle: remediation.title,
        remediationNote: remediation.instruction,
      });
      wx.nextTick(() => {
        writingContext = wx.createCanvasContext("writingCanvas", this);
        writingContext.clearRect(0, 0, 640, 640);
        writingContext.draw();
      });
      return;
    }
    const remediation = remediationFor(question, this.data.questionTrack);
    const correctAnswer = question.questionType === "image_single_select"
      ? (character.media?.visual?.label || character.originalMeaning || character.hanzi)
      : question.kind === "write"
        ? `在方格里写完整的「${character.hanzi}」`
        : this.data.viewOptions.filter((option) => option.correct).map((option) => option.text || character.hanzi).join("、");
    this.setData({
      answered: true,
      ready: false,
      writingRewrite: false,
      showWritingRemediation: false,
      hideVisualCaptions: false,
      showPendingActions: false,
      correct,
      progress: Math.round((this.data.questionIndex + 1) / this.data.questions.length * 100),
      sessionResults,
      passedQuestionIds: nextPassedQuestionIds,
      streak,
      streakMotion: correct && streak >= 2
        ? (this.data.streakMotion === "streak-a" ? "streak-b" : "streak-a")
        : this.data.streakMotion,
      currentAttempts: this.data.currentAttempts + 1,
      firstTryRate: Math.min(100, Math.round(this.data.questions.length * 100 / Math.max(sessionResults.length, this.data.questions.length))),
      perfect: sessionResults.length === this.data.questions.length,
      resultTitle: question.kind === "write" && correct ? "自查通过" : correct ? "答对了" : remediation.cue,
      resultCopy: question.kind === "write" && correct
        ? "已按你的对照自查记录为正确（未经过客观识别）；范字会保留到下一题。"
        : correct
          ? (question.explanation || "记住这个线索，再去下一题。")
          : "",
      resultAnswer: correct ? "" : correctAnswer,
      resultAnswerIsGlyph: !correct && Array.from(correctAnswer).length <= 6,
      resultNote: correct ? "" : remediation.instruction,
      assemblySlots: assemblySlots(question, character, correctIds, selectedIds, true),
      viewOptions: this.data.viewOptions.map((option) => ({
        ...option,
        state: this.data.splitAssembly
          ? (selectedIds.includes(option.id) ? "is-picked" : "")
          : option.correct ? "correct" : selectedIds.includes(option.id) ? "wrong" : "",
        showParts: this.data.glyphChoices
          && option.correct
          && option.text === character.hanzi
          && (character.parts?.length ?? 0) > 1,
        showMnemonicFocus: Boolean(option.correct && option.image),
      })),
    });
  },
  nextQuestion() {
    if (!this.data.correct) {
      this.prepareQuestion(true);
      return;
    }
    if (this.data.passedQuestionIds.length >= this.data.questions.length) {
      playLearningSound("complete");
      this.setData({ finished: true });
      return;
    }
    const nextIndex = this.data.questions.findIndex((step, index) =>
      index > this.data.questionIndex && !this.data.passedQuestionIds.includes(step.exercise.id));
    const wrappedIndex = this.data.questions.findIndex((step) =>
      !this.data.passedQuestionIds.includes(step.exercise.id));
    this.setData({ questionIndex: nextIndex >= 0 ? nextIndex : wrappedIndex });
    this.prepareQuestion();
  },
  previousQuestion() {
    if (this.data.questionIndex === 0 || this.data.answered || this.data.writingRewrite) return;
    this.setData({ questionIndex: this.data.questionIndex - 1 });
    this.prepareQuestion();
  },
  skipQuestion() {
    if (this.data.answered || this.data.writingRewrite) return;
    const nextIndex = this.data.questions.findIndex((step, index) =>
      index > this.data.questionIndex && !this.data.passedQuestionIds.includes(step.exercise.id));
    const wrappedIndex = this.data.questions.findIndex((step, index) =>
      index !== this.data.questionIndex && !this.data.passedQuestionIds.includes(step.exercise.id));
    if (nextIndex < 0 && wrappedIndex < 0) {
      wx.showToast({ title: "这是最后一道待完成题", icon: "none" });
      return;
    }
    this.setData({ questionIndex: nextIndex >= 0 ? nextIndex : wrappedIndex });
    this.prepareQuestion();
  },
  replayCharacter() {
    playLearningSound("start");
    const sessionSalt = `${Date.now()}-${Math.random()}`;
    this.setData({
      finished: false,
      questionIndex: 0,
      sessionResults: [],
      passedQuestionIds: [],
      streak: 0,
      currentAttempts: 0,
      sessionSalt,
      celebrationParts: this.data.celebrationParts.map((part, index) => ({
        ...part,
        key: `${part.char}-${index}-${sessionSalt}`,
      })),
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
    playLearningSound("encourage");
    this.setData({ characterIndex: this.data.characterIndex + 1 });
    this.prepareCharacter();
  },
  finishSession() { this.goBack(); },
  goBack() { wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/practice-hub/index" }) }); },
  retry() { this.setData({ error: "", loading: true }); void this.loadSession(); },
});
