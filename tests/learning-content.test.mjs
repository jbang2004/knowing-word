import assert from "node:assert/strict";
import test from "node:test";
import { characters, lessons } from "../app/data/catalog.ts";
import { grade5Characters } from "../app/data/grade5-volume1-generated.ts";
import { loadLessonContent } from "../app/data/lesson-content.ts";
import { getPracticeSteps, practiceDimension } from "../app/domain/practice.ts";
import { isIndependentAttempt } from "../app/domain/learning-state.ts";
import { narrationMedia } from "../app/domain/narration-media.ts";
import { validateLearningContent } from "../scripts/validate-learning-content.mjs";
import { grade5SemanticGold } from "../scripts/grade5-semantic-gold.mjs";

test("all official records carry explicit component and exercise evidence", () => {
  const report = validateLearningContent({ strictExtensions: true });
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.warnings, []);
  assert.equal(report.stats.records, 430);
  assert.equal(report.stats.officialRecords, 365);
  assert.equal(report.stats.extensionRecords, 65);
  assert.equal(
    report.stats.officialPartsWithRoleMetadata,
    report.stats.officialParts,
  );
  assert.equal(
    report.stats.officialExercisesWithLearningMetadata,
    report.stats.officialExercises,
  );
  assert.equal(
    report.stats.concealedOfficialRecallWriting,
    report.stats.officialRecallWriting,
  );
  assert.equal(
    report.stats.pictophoneticRecordsWithCaveat,
    report.stats.pictophoneticRecords,
  );
  assert.equal(report.stats.allPartsWithRoleMetadata, report.stats.allParts);
  assert.equal(report.stats.allExercisesWithLearningMetadata, report.stats.allExercises);
  assert.equal(report.stats.recordsWithSixDimensions, 430);
  assert.equal(report.stats.confusionDiscriminationRecords, 430);
  assert.equal(report.stats.independentGenerationRecords, 430);
  assert.equal(report.stats.semanticGoldRecords, 430);
  assert.equal(report.stats.semanticTargetLeakRecords, 0);
  assert.equal(report.stats.semanticClassMismatchRecords, 0);
  assert.equal(report.stats.semanticUniqueLongestRecords, 0);
  assert.equal(report.stats.semanticLengthOutlierRecords, 0);
  assert.deepEqual(report.stats.dimensionCoverage, {
    recognition: 430,
    phonology: 430,
    semantics: 430,
    generation: 430,
    discrimination: 430,
    context: 430,
  });
});

test("known radical-versus-role conflicts follow etymology rather than radical fallback", () => {
  const expected = {
    "亩": { semantic: "田" },
    "协": { semantic: "办", phonetic: "十" },
    "党": { semantic: "兄", phonetic: "尚" },
    "辈": { semantic: "车", phonetic: "非" },
    "炭": { semantic: "灰", phonetic: "山" },
    "毕": { semantic: "十", phonetic: "比" },
    "舅": { semantic: "男", phonetic: "臼" },
    "斩": { semantic: "斤", phonetic: "车" },
    "甸": { semantic: "勹", phonetic: "田" },
  };
  for (const [hanzi, roles] of Object.entries(expected)) {
    const records = grade5Characters.filter((item) => item.hanzi === hanzi);
    assert.ok(records.length > 0, "missing test character " + hanzi);
    for (const record of records) {
      for (const [role, normalizedChar] of Object.entries(roles)) {
        assert.ok(
          record.parts.some((part) =>
            (part.role === role || part.role === "mixed")
            && (part.char === normalizedChar || part.normalizedChar === normalizedChar)
          ),
          hanzi + " should mark " + normalizedChar + " as " + role,
        );
      }
    }
  }
});

test("component variants preserve the visible glyph and normalize the evidence", () => {
  const foot = grade5Characters.find((item) => item.hanzi === "趴");
  const meat = grade5Characters.find((item) => item.hanzi === "胎");
  assert.deepEqual(
    foot.parts.find((part) => part.char === "⻊"),
    {
      char: "⻊",
      role: "semantic",
      normalizedChar: "足",
      functionText: "“⻊”在这个字里是表义部件，提示意义类别。",
      confidence: "verified",
      source: "Make Me a Hanzi etymology.semantic + standard component variant",
      radical: true,
    },
  );
  assert.equal(meat.parts.find((part) => part.char === "月")?.normalizedChar, "肉");
  assert.equal(meat.parts.find((part) => part.char === "月")?.role, "semantic");
});

test("independent writing cues do not expose the target in visible or spoken text", () => {
  const writingRecords = grade5Characters.filter((item) =>
    item.curriculumRole === "write"
  );
  assert.equal(writingRecords.length, 220);
  for (const item of writingRecords) {
    const recall = item.exercises.find((exercise) =>
      exercise.questionType === "write_full_word_empty"
    );
    assert.ok(recall, "missing recall task for " + item.id);
    assert.equal(recall.concealTarget, true);
    assert.equal(recall.dimension, "generation");
    assert.equal(recall.answerMode, "handwriting");
    assert.equal(recall.cueLevel, 0);
    assert.ok(!recall.prompt.includes(item.hanzi));
    assert.ok(!recall.spokenPrompt.includes(item.hanzi));
  }
});

test("every pictophonetic record states the probabilistic sound-component limit", () => {
  const pictophonetic = grade5Characters.filter((item) =>
    item.charType.includes("形声")
  );
  assert.ok(pictophonetic.length > 200);
  for (const item of pictophonetic) {
    assert.match(item.description, /声旁只提供.*读音线索/);
    assert.match(item.description, /词语核实/);
  }
});

test("all 430 records expose six real activities without leaking retrieval cues", () => {
  const dimensions = [
    "recognition",
    "phonology",
    "semantics",
    "generation",
    "discrimination",
    "context",
  ];
  assert.equal(characters.length, 430);
  for (const item of characters) {
    for (const dimension of dimensions) {
      assert.ok(
        item.exercises.some((exercise) => exercise.dimension === dimension),
        item.id + " lacks " + dimension,
      );
    }
    const recognition = item.exercises.find((exercise) =>
      exercise.dimension === "recognition"
      && exercise.cueLevel === 0
      && (
        exercise.id.endsWith("-science-recognition")
        || exercise.id.endsWith("-words-context")
      )
    );
    const context = item.exercises.find((exercise) =>
      exercise.id.endsWith("-science-context")
    );
    const discrimination = item.exercises.find((exercise) =>
      exercise.id.endsWith("-science-discrimination")
    );
    assert.ok(recognition);
    assert.ok(context);
    assert.ok(discrimination);
    assert.ok(!recognition.prompt.includes(item.hanzi));
    assert.ok(!context.prompt.includes(item.hanzi));
    assert.ok(!discrimination.prompt.includes(item.hanzi));
    assert.equal((context.prompt.match(/□/gu) || []).length, 1);
    assert.equal((discrimination.prompt.match(/□/gu) || []).length, 1);
    assert.equal(discrimination.cueLevel, 0);
    assert.equal(discrimination.concealTarget, true);
    assert.ok(discrimination.options.filter((option) =>
      !option.correct
      && discrimination.optionErrorTags[option.id]?.some((tag) =>
        tag === "homophone-confusion" || tag === "lookalike-confusion"
      )
    ).length >= 2);
    assert.doesNotMatch(context.prompt, /本课哪个词/);
  }
});

test("鹭 uses real homophone and component confusions instead of unrelated glyphs", () => {
  const egret = grade5Characters.find((item) => item.hanzi === "鹭");
  assert.ok(egret);
  for (const idSuffix of ["-words-context", "-science-context", "-science-discrimination"]) {
    const exercise = egret.exercises.find((item) => item.id.endsWith(idSuffix));
    assert.ok(exercise, "missing 鹭 exercise " + idSuffix);
    const distractors = exercise.options.filter((option) => !option.correct);
    assert.ok(distractors.some((option) => ["露", "路", "陆"].includes(option.text)));
    assert.ok(distractors.every((option) => !["匣", "框", "吩"].includes(option.text)));
    assert.ok(distractors.every((option) =>
      exercise.optionErrorTags[option.id]?.some((tag) =>
        tag === "homophone-confusion" || tag === "lookalike-confusion"
      )
    ));
  }
  const semantics = egret.exercises.find((exercise) =>
    exercise.id.endsWith("-science-semantics")
  );
  assert.match(semantics.options.find((option) => option.correct).text, /羽毛洁白.*水田.*河滩/);
  assert.equal(semantics.semanticClass, "animal");
  assert.ok(semantics.options.every((option) =>
    !option.text.includes("鹭") && !option.text.includes("白鹭")
  ));
});

test("抗日 and 乃至 use the lesson word's contextual meaning and a new sentence", () => {
  const resistance = characters.find((item) => item.hanzi === "抗" && item.word === "抗日");
  const japan = characters.find((item) => item.hanzi === "日" && item.word === "抗日");
  const nai = characters.find((item) => item.hanzi === "乃" && item.word === "乃至");
  assert.ok(resistance);
  assert.ok(japan);
  assert.ok(nai);

  const science = (item, dimension) => item.exercises.find((exercise) =>
    exercise.dimension === dimension && exercise.id.includes("-words-science-")
  );
  const correctText = (exercise) =>
    exercise.options.find((option) => option.correct)?.text || "";

  assert.match(resistance.contextualMeaning, /抗日.*抵抗.*反抗侵略/);
  assert.match(correctText(science(resistance, "semantics")), /抵御侵略.*保卫家园/);
  assert.match(science(resistance, "context").prompt, /□日斗争/);
  const resistanceSynonyms = /抵御|抵挡|抵抗|反抗|抗拒|挡住|阻挡/u;
  assert.ok(science(resistance, "semantics").options.filter((option) => !option.correct)
    .every((option) => !resistanceSynonyms.test(option.text)));

  assert.match(japan.contextualMeaning, /日本的简称/);
  assert.doesNotMatch(correctText(science(japan, "semantics")), /太阳/);
  assert.match(correctText(science(japan, "semantics")), /侵华战争.*国家简称/);
  assert.match(science(japan, "context").prompt, /抗□斗争/);

  assert.match(nai.contextualMeaning, /乃至.*甚至、以至于/);
  assert.match(correctText(science(nai, "semantics")), /甚至、以至于/);
  assert.match(science(nai, "context").prompt, /□至外地游客/);
});

test("semantic distractors never contain or repeat the correct lesson meaning", () => {
  const normalize = (value) => String(value)
    .replace(/[“”‘’「」『』，、。；：！？,.!?;:\s]/gu, "")
    .replace(/(?:表示|意思是|指的是|本义是|在这里|这个词)/gu, "");
  for (const item of characters) {
    const exercise = item.exercises.find((candidate) =>
      candidate.id.endsWith("-science-semantics")
    );
    assert.ok(exercise, item.id + " lacks contextual semantics");
    const correct = normalize(exercise.options.find((option) => option.correct)?.text);
    const correctOption = exercise.options.find((option) => option.correct);
    const wrongOptions = exercise.options.filter((candidate) => !candidate.correct);
    const goldKey = `${item.hanzi}|${item.word}`;
    const gold = grade5SemanticGold[goldKey];
    assert.ok(gold, "missing semantic gold " + goldKey);
    assert.equal(gold.senseReviewed, true);
    assert.ok(gold.senseSource);
    assert.equal(gold.wordSenseKey, `lesson-word:${item.word}`);
    assert.equal(exercise.semanticGoldKey, goldKey);
    assert.equal(exercise.semanticGoldSource, "frozen-lesson-word-gold");
    assert.equal(exercise.semanticDistractorSource, "explicit-class-bank");
    assert.equal(correctOption.text, gold.option);
    assert.equal(exercise.semanticClass, gold.semanticClass);
    assert.equal(exercise.semanticForm, gold.semanticForm);
    assert.ok(exercise.semanticClass, item.id + " lacks semantic class");
    assert.ok(exercise.semanticForm, item.id + " lacks semantic form");
    assert.ok(exercise.optionSemanticClasses, item.id + " lacks option classes");
    assert.ok(exercise.options.every((option) =>
      !option.text.includes(item.hanzi)
      && !option.text.includes(item.word)
      && exercise.optionSemanticClasses[option.text] === exercise.semanticClass
    ), item.id + " leaks the target or mixes semantic classes");
    for (const option of exercise.options.filter((candidate) => !candidate.correct)) {
      const wrong = normalize(option.text);
      assert.ok(
        !correct.includes(wrong) && !wrong.includes(correct),
        item.id + " has a contained semantic distractor: " + option.text,
      );
    }
    const correctLength = Array.from(correctOption.text).length;
    const wrongLengths = wrongOptions.map((option) => Array.from(option.text).length);
    assert.ok(
      correctLength <= Math.max(...wrongLengths),
      item.id + " reveals the answer as the uniquely longest option",
    );
    assert.ok(
      wrongLengths.every((length) =>
        Math.abs(length - correctLength) <= Math.max(4, Math.ceil(correctLength * 0.5))
      ),
      item.id + " reveals the answer through an outlying length",
    );
  }
});

test("reviewed semantic gold preserves representative lesson-word facts", () => {
  const expected = {
    "酸|心酸": /难过.*委屈.*内心悲伤/,
    "馈|反馈": /结果或意见传回/,
    "津|天津": /直辖市/,
    "简|简直": /加强语气.*完全如此/,
    "常|照常": /平时的方式/,
    "照|照常": /平时的方式/,
    "尽|无穷无尽": /没有边界.*没有终点/,
    "涨|涨潮": /水面.*升高/,
    "菌|杀菌": /杀死有害微生物/,
    "嫉|嫉妒": /别人比自己好.*不舒服/,
    "妒|嫉妒": /别人比自己好.*不舒服/,
    "茧|蚕茧": /吐丝.*椭圆形外壳/,
    "睑|眼睑": /眼睛外面.*开合的皮肤/,
    "盾|矛盾": /彼此冲突.*同时成立/,
    "筷|筷子": /细长餐具.*夹取食物/,
    "枕|枕头": /垫在头下.*支撑头颈/,
    "磁|磁铁": /吸引铁.*材料/,
  };
  for (const [key, pattern] of Object.entries(expected)) {
    assert.match(grade5SemanticGold[key].option, pattern, key);
  }
});

test("a narration release with a legacy lesson word is withheld until rereview", () => {
  const character = characters.find((item) => item.id === "g5v1-l25-c09-u715e");
  assert.ok(character);
  assert.equal(character.word, "煞有介事");
  assert.match(character.originalMeaning, /装作真有那么回事/);
  assert.doesNotMatch(character.description, /煞气/);
  const media = narrationMedia(
    character.id,
    "煞气指凶狠逼人的气势。",
    character.description,
  );
  assert.equal(media.audio, "");
  assert.equal(media.marks, "");
  assert.equal(media.transcript, character.description);
  assert.match(media.transcript, /装作真有那么回事/);
  assert.doesNotMatch(media.transcript, /煞气/);
});

test("all 430 records have objective target-hidden generation evidence", () => {
  for (const item of characters) {
    const objective = item.exercises.find((exercise) =>
      exercise.id.endsWith("-science-generation")
    );
    assert.ok(objective, item.id);
    assert.equal(objective.cueLevel, 0);
    assert.equal(objective.answerMode, "choice");
    assert.equal(objective.concealTarget, true);
    assert.ok(!objective.prompt.includes(item.hanzi));
    assert.ok(objective.options.every((option) => !option.text.includes(item.hanzi)));
    assert.equal(isIndependentAttempt({
      cueLevel: objective.cueLevel,
      answerMode: objective.answerMode,
      correct: true,
    }), true);
    const runtimeGeneration = getPracticeSteps(item, "words", "mastery")
      .filter(({ exercise, track }) =>
        practiceDimension(exercise, track) === "generation"
      )
      .map(({ exercise }) => exercise);
    assert.ok(runtimeGeneration.some((exercise) => exercise.id === objective.id));
  }
  const writing = characters.filter((item) =>
    item.exercises.some((exercise) => exercise.questionType === "write_full_word_empty")
  );
  assert.equal(writing.length, 249);
  assert.ok(writing.every((item) =>
    item.exercises.some((exercise) => exercise.kind === "write" && exercise.concealTarget !== true)
    && item.exercises.some((exercise) =>
      exercise.kind === "write" && exercise.concealTarget === true
    )
  ));
  for (const item of writing) {
    const generation = getPracticeSteps(item, "words", "mastery")
      .filter(({ exercise, track }) =>
        practiceDimension(exercise, track) === "generation"
      )
      .map(({ exercise }) => exercise);
    assert.ok(generation.some((exercise) =>
      exercise.kind === "write" && exercise.concealTarget !== true
    ));
    assert.ok(generation.some((exercise) =>
      exercise.kind === "write" && exercise.concealTarget === true
    ));
  }
});

test("unsupported pictophonetic and ideographic labels fall back conservatively", () => {
  const unsupportedSoundEvidence = Array.from("嵌亩茶稳强赢枚珍塌熏哉瑶览瞒秀惫权抛鉴");
  for (const hanzi of unsupportedSoundEvidence) {
    const records = grade5Characters.filter((item) => item.hanzi === hanzi);
    assert.ok(records.length > 0, "missing conservative type case " + hanzi);
    for (const item of records) {
      assert.equal(item.charType, "现代字形字");
      assert.doesNotMatch(item.description, /声旁只提供/);
      assert.match(item.description, /教学证据不足/);
    }
  }
  const between = grade5Characters.find((item) => item.hanzi === "间");
  const nai = grade5Characters.find((item) => item.hanzi === "乃");
  assert.equal(between.charType, "会意字");
  assert.match(between.description, /“门”和“日”共同会意/);
  assert.ok(between.parts.every((part) => part.role === "semantic"));
  assert.equal(nai.charType, "现代字形字");
  assert.doesNotMatch(nai.description, /共同会意/);
});

test("runtime lesson loading preserves the strict 430-record overlay", async () => {
  const loaded = [];
  for (const lesson of lessons) {
    const content = await loadLessonContent(lesson.id);
    assert.ok(content);
    loaded.push(...content.characters);
  }
  assert.equal(loaded.length, 430);
  assert.deepEqual(
    new Set(loaded.map((item) => item.id)),
    new Set(characters.map((item) => item.id)),
  );
  for (const item of loaded) {
    assert.ok(item.parts.every((part) =>
      part.role && part.normalizedChar && part.functionText && part.confidence && part.source
    ));
    assert.equal(
      new Set(item.exercises.map((exercise) => exercise.dimension)).size,
      6,
      item.id + " lost one learning dimension while loading its lesson",
    );
    const runtimeDimensions = new Set(
      getPracticeSteps(item, "words", "mastery")
        .map(({ exercise, track }) => practiceDimension(exercise, track)),
    );
    assert.deepEqual(
      [...runtimeDimensions].sort(),
      ["context", "discrimination", "generation", "phonology", "recognition", "semantics"],
      item.id + " has content metadata that the runtime cannot reach",
    );
    const runtimeDiscrimination = getPracticeSteps(item, "words", "mastery")
      .find(({ exercise, track }) =>
        practiceDimension(exercise, track) === "discrimination"
      )?.exercise;
    assert.ok(runtimeDiscrimination?.id.endsWith("-science-discrimination"));
    assert.equal(runtimeDiscrimination.cueLevel, 0);
  }
});
