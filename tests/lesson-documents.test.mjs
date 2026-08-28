import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  grade5LessonLearning,
  grade5Volume1Lessons,
} from "../app/data/grade5-volume1-source.ts";
import { loadLessonContent } from "../app/data/lesson-content.ts";
import {
  getPublishableLessonDocument,
  isLessonDocumentPublishable,
  lessonDocuments,
} from "../app/data/lesson-documents.ts";

const proseFailures = [
  ["中文或英文冒号", /[：:]/],
  ["破折号", /[—–]/],
  ["翻案句式", /不是.{0,24}而是|并非.{0,24}而是|不在于.{0,24}而在于/],
  ["空泛产品词", /赋能|闭环|底层逻辑|顶层设计|认知跃迁|价值释放/],
  ["写作翻案模板", /与其说.{0,24}不如说|不只.{0,24}(?:还|也)|表面.{0,24}实际|看似.{0,24}实则/],
  ["模型路标", /更微妙的是|还有一层|只说对了一半|值得注意的是|需要指出的是|从某种意义上说|说白了|说穿了|先说结论/],
  ["商业黑话", /赋能|抓手|商业闭环|价值闭环|能力沉淀|打法|拉通|能力建设|降本增效|内容矩阵|全链路|组合拳|打开想象空间|想象空间|结构性机会|关键命题|深层逻辑|技术底座|公共底座|技术主权|单点风险|主脊柱|材料锚点|认知增量|迭代闭环/],
];

test("all 26 lessons have complete, publishable reading guides", () => {
  const expectedIds = grade5Volume1Lessons.map(
    (_, index) => `g5v1-l${String(index + 1).padStart(2, "0")}`,
  );
  assert.deepEqual(Object.keys(lessonDocuments).sort(), expectedIds.sort());

  for (const [index, lesson] of grade5Volume1Lessons.entries()) {
    const lessonId = `g5v1-l${String(index + 1).padStart(2, "0")}`;
    const document = lessonDocuments[lessonId];
    assert.ok(document, `${lessonId} has no reading document`);
    assert.equal(document.lessonId, lessonId);
    assert.equal(document.rights.status, "original");
    assert.equal(document.rights.publicDisplay, "full");
    assert.equal(document.rights.basis, "authored-in-project");
    assert.match(document.rights.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(isLessonDocumentPublishable(document), true);
    assert.equal(getPublishableLessonDocument(lessonId), document);
    assert.equal(document.sections.length, 3, `${lessonId} needs a three-part rhythm`);
    assert.equal(document.format, "guide");
    assert.deepEqual(
      document.sections.map((section) => section.title),
      grade5LessonLearning[index + 1].path,
      `${lessonId} must follow the curriculum reading path`,
    );

    const paragraphs = document.sections.flatMap((section) => section.paragraphs);
    assert.ok(paragraphs.length >= 3 && paragraphs.length <= 6);
    assert.deepEqual(
      paragraphs.map((paragraph) => paragraph.id),
      paragraphs.map((_, paragraphIndex) => `lesson-paragraph-${paragraphIndex + 1}`),
    );
    for (const paragraph of paragraphs) {
      assert.ok(paragraph.text.length >= 30, `${lessonId} has a fragmentary paragraph`);
      assert.ok(paragraph.text.length <= 180, `${lessonId} has an overlong paragraph`);
    }

    const prose = paragraphs.map((paragraph) => paragraph.text).join("");
    if (document.format === "guide") {
      assert.ok(document.intro && document.intro.length >= 50 && document.intro.length <= 180);
      const focusWords = document.sections.flatMap((section) => {
        assert.ok(section.question && section.question.length >= 12);
        assert.ok(section.focusWords && section.focusWords.length > 0);
        return section.focusWords;
      });
      assert.deepEqual(
        [...focusWords].sort(),
        [...lesson.words].sort(),
        `${lessonId} guide must assign every target word once`,
      );
      assert.equal(new Set(focusWords).size, focusWords.length, `${lessonId} guide repeats a target word`);
      assert.match(document.rights.label, /课文导读/);
      assert.match(document.rights.note, /不展示教材正文/);
    }
    const text = [document.intro ?? "", prose, ...document.sections.map((section) => section.question ?? "")].join("");
    for (const [label, pattern] of proseFailures) {
      assert.doesNotMatch(text, pattern, `${lessonId} contains ${label}`);
    }
  }
});

test("every focus word resolves to every official target card exactly once", async () => {
  for (const document of Object.values(lessonDocuments)) {
    const content = await loadLessonContent(document.lessonId);
    assert.ok(content, `${document.lessonId} has no lesson content`);
    const targets = content.characters.filter((item) => item.primary && item.official !== false);
    const assigned = document.sections.flatMap((section) =>
      (section.focusWords ?? []).flatMap((word) =>
        targets.filter((character) => character.word === word).map((character) => character.id),
      ),
    );
    assert.deepEqual(
      assigned.sort(),
      targets.map((character) => character.id).sort(),
      `${document.lessonId} guide does not resolve to its complete card set`,
    );
    assert.equal(new Set(assigned).size, assigned.length, `${document.lessonId} repeats a target card`);
  }
});

test("every focus-word pinyin can be placed under its exact target glyph", async () => {
  let focusWordCount = 0;
  let nonInitialTargetCount = 0;
  let multipleTargetCount = 0;
  let repeatedTargetGlyphCount = 0;

  for (const document of Object.values(lessonDocuments)) {
    const content = await loadLessonContent(document.lessonId);
    assert.ok(content, `${document.lessonId} has no lesson content`);
    const targets = content.characters.filter((item) => item.primary && item.official !== false);
    for (const section of document.sections) {
      for (const word of section.focusWords ?? []) {
        focusWordCount += 1;
        const glyphs = Array.from(word);
        const wordTargets = targets.filter((character) => character.word === word);
        if (wordTargets.length > 1) multipleTargetCount += 1;
        for (const character of wordTargets) {
          const positions = glyphs.flatMap((glyph, index) => glyph === character.hanzi ? [index] : []);
          assert.ok(positions.length > 0, `${document.lessonId} ${word} cannot place ${character.pinyin} under ${character.hanzi}`);
          assert.ok(character.pinyin.length > 0, `${document.lessonId} ${word} has an empty pinyin label for ${character.hanzi}`);
          if (positions.some((position) => position > 0)) nonInitialTargetCount += 1;
          if (positions.length > 1) repeatedTargetGlyphCount += 1;
        }
      }
    }
  }

  assert.equal(focusWordCount, 341);
  assert.ok(nonInitialTargetCount > 150);
  assert.equal(multipleTargetCount, 25);
  assert.equal(repeatedTargetGlyphCount, 9);
});

test("the rights gate blocks unverified and metadata-only documents", () => {
  const base = structuredClone(lessonDocuments["g5v1-l01"]);
  assert.equal(
    isLessonDocumentPublishable({
      ...base,
      rights: { ...base.rights, status: "unverified", publicDisplay: "full" },
    }),
    false,
  );
  assert.equal(
    isLessonDocumentPublishable({
      ...base,
      rights: { ...base.rights, publicDisplay: "metadata-only" },
    }),
    false,
  );
  assert.equal(
    isLessonDocumentPublishable({
      ...base,
      rights: { ...base.rights, status: "licensed", basis: "" },
    }),
    false,
  );
});

test("legacy extension records cannot reintroduce textbook excerpts", async () => {
  const source = await readFile(
    new URL("../app/data/extension-characters.ts", import.meta.url),
    "utf8",
  );
  const contexts = [...source.matchAll(/"originalText": "((?:[^"\\]|\\.)*)"/g)];
  assert.equal(contexts.length, 65);
  assert.equal(contexts.filter((match) => match[1].length > 0).length, 0);
  assert.match(source, /lesson loader[\s\S]*project-authored theme context/);
});
