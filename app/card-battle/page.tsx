import type { Metadata } from "next";
import { loadLessonContent } from "../data/lesson-content";
import { grade5Lessons } from "../data/generated/grade5-volume1/course";
import { buildBattleQuestions } from "../lib/card-battle";
import CardBattle from "./card-battle";

export const metadata: Metadata = { title: "字灵秘境 · 知字卡牌冒险", description: "用汉字唤醒法术，挑战秘境守关者。" };
export default async function CardBattlePage({ searchParams }: { searchParams: Promise<{ lesson?: string }> }) {
  const { lesson: requested } = await searchParams;
  const content = await loadLessonContent(requested ?? "g5v1-l01") ?? await loadLessonContent("g5v1-l01");
  const questions = buildBattleQuestions(content?.characters ?? []);
  // Vinext combines imported route CSS; a React-managed stylesheet keeps the shared bundle within its budget.
  // eslint-disable-next-line @next/next/no-css-tags
  return <><link rel="stylesheet" href="/card-battle/battle.css" precedence="card-battle" /><CardBattle key={content?.lesson.id} questions={questions} lessonId={content?.lesson.id ?? "g5v1-l01"} lessonTitle={content?.lesson.title ?? "白鹭"} lessons={grade5Lessons.map(({ id, title, position }) => ({ id, title, position }))} /></>;
}
