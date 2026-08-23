import type { CharacterItem, Exercise } from "../data/catalog-types";
import {
  LESSON_THREE_ID,
  getLessonThreeKnowledge,
  type LessonThreeKnowledge,
} from "../data/lesson3-literacy";
import type { TrackId } from "../lib/profile-model";

const exerciseOrigin: Record<TrackId, string> = {
  words: "识字小测",
  split: "拆一拆",
  honglan: "红蓝字",
  structure: "空间结构",
};

function exerciseOption(id: string, text: string, correct = false): Exercise["options"][number] {
  return { id, text, correct, radical: false, idcCode: "" };
}

function createLessonThreeMethodExercise(
  character: CharacterItem,
  knowledge: LessonThreeKnowledge,
): Exercise {
  const id = `${character.id}-words-method`;
  if (knowledge.method === "phonosemantic") {
    const phonetic = knowledge.components.find((component) => component.role === "phonetic")!;
    const semantic = knowledge.components.find((component) => component.role === "semantic")!;
    return {
      id,
      origin: "words",
      kind: "single",
      questionType: "lesson3_method_select",
      prompt: `“${character.hanzi}”中，哪个部件主要提示读音？`,
      options: [
        exerciseOption(`${id}-phonetic`, `${phonetic.glyph}：${phonetic.note}`, true),
        exerciseOption(`${id}-semantic`, `${semantic.glyph}：${semantic.note}`),
        exerciseOption(`${id}-picture`, "整张插图：看见画面就能确定读音"),
        exerciseOption(`${id}-story`, "记忆故事：故事里的每件物品都表音"),
      ],
      explanation: `${knowledge.explanation} 形旁和声旁都只是线索，还要放回“${character.word}”核对。`,
    };
  }

  return {
    id,
    origin: "words",
    kind: "single",
    questionType: "lesson3_method_select",
    prompt: `学习“${character.hanzi}”时，哪一种记法最可靠？`,
    options: [
      exerciseOption(`${id}-route`, knowledge.recallCue, true),
      exerciseOption(`${id}-origin`, "把助记图片当作这个字的真实历史来源"),
      exerciseOption(`${id}-guess`, "只记一张漂亮图片，不观察部件位置"),
      exerciseOption(`${id}-sound`, "把每个部件都当成准确的读音提示"),
    ],
    explanation: `${knowledge.explanation} ${knowledge.evidence}`,
  };
}

export function getTrackExercises(character: CharacterItem, track: TrackId) {
  const exercises = character.exercises.filter((exercise) => exercise.origin === exerciseOrigin[track]);
  if (character.lessonId !== LESSON_THREE_ID || track !== "words") return exercises;

  const knowledge = getLessonThreeKnowledge(character.hanzi);
  if (!knowledge) return exercises;

  const noImageExercises = exercises.filter((exercise) => exercise.questionType !== "image_single_select");
  const methodExercise = createLessonThreeMethodExercise(character, knowledge);
  const insertAt = Math.min(1, noImageExercises.length);
  return [
    ...noImageExercises.slice(0, insertAt),
    methodExercise,
    ...noImageExercises.slice(insertAt),
  ];
}

export function stableOptionOrder(options: Exercise["options"], seed: string) {
  const hash = [...seed].reduce(
    (value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0,
    2166136261,
  );
  return [...options]
    .map((option, index) => ({
      option,
      rank: (hash ^ ((index + 1) * 2654435761)) >>> 0,
    }))
    .sort((left, right) => left.rank - right.rank)
    .map(({ option }) => option);
}

export function expectedAnswerIds(
  question: Exercise,
  character: CharacterItem,
  track: TrackId,
) {
  if (track === "split" && question.kind === "components") {
    const inOrder = character.parts
      .map((part) => question.options.find(
        (option) => option.correct && option.text === part.char,
      )?.id)
      .filter((id): id is string => Boolean(id));
    if (inOrder.length) return inOrder;
  }
  return question.options.filter((option) => option.correct).map((option) => option.id);
}

export function isPracticeAnswerCorrect(
  question: Exercise,
  character: CharacterItem,
  track: TrackId,
  selected: string[],
  wrote: boolean,
) {
  if (question.kind === "write") return wrote;
  const expected = expectedAnswerIds(question, character, track);
  if (track === "split" && question.kind === "components") {
    return expected.length === selected.length && expected.every((id, index) => selected[index] === id);
  }
  const current = [...selected].sort();
  const target = [...expected].sort();
  return current.length === target.length && current.every((id, index) => id === target[index]);
}

export function questionTypeLabel(question: Exercise, track: TrackId) {
  if (question.kind === "write") return "写整字";
  if (track === "honglan") return "红蓝字";
  if (track === "split" || question.kind === "components") return "组字 · 选字";
  if (question.kind === "structure") return "结构选择";
  if (question.questionType === "image_single_select") return "看图选择";
  return "选择题";
}
