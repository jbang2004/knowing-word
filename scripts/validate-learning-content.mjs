import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { grade5Characters } from "../app/data/grade5-volume1-generated.ts";
import { grade5ExtensionCharacters } from "../app/data/generated/grade5-volume1/extension-learning.ts";
import { grade5SemanticGold } from "./grade5-semantic-gold.mjs";

const componentRoles = new Set(["semantic", "phonetic", "graphic", "mixed"]);
const componentConfidences = new Set(["verified", "probable", "mnemonic-only"]);
const skillDimensions = new Set([
  "recognition",
  "phonology",
  "semantics",
  "generation",
  "discrimination",
  "context",
]);
const answerModes = new Set(["choice", "speech", "handwriting", "self-check"]);
const meaningSynonymGroups = [
  ["抵御", "抵挡", "抵抗", "反抗", "抗拒", "挡住", "阻挡"],
  ["帮助", "协助", "援助", "帮忙"],
  ["害怕", "恐惧", "惧怕", "畏惧"],
  ["喜爱", "喜欢", "爱好", "嗜好"],
  ["观看", "观察", "注视", "凝视"],
  ["快速", "迅速", "飞快", "敏捷"],
];
const disallowedSemanticRhetoric = /希望|力量|精神|见证|梦想|深情|爱国|心旷神怡|扼腕|不屈|滋味|心田|食粮|厚谊|豪情|前程|水乡|童心|求学|护航|人生|盛世|中华智慧|彰显|令人|温暖|感动|关怀|欢乐|可爱|期待|欣慰|智慧|真挚|价值连城|奇珍异宝|别有/u;

const roleConsistencyCases = {
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

function validPartMetadata(part) {
  return componentRoles.has(part.role)
    && typeof part.normalizedChar === "string"
    && part.normalizedChar.length > 0
    && typeof part.functionText === "string"
    && part.functionText.length > 0
    && componentConfidences.has(part.confidence)
    && typeof part.source === "string"
    && part.source.length > 0;
}

function validExerciseMetadata(exercise) {
  return skillDimensions.has(exercise.dimension)
    && answerModes.has(exercise.answerMode)
    && [0, 1, 2, 3].includes(exercise.cueLevel)
    && exercise.optionErrorTags
    && typeof exercise.optionErrorTags === "object"
    && exercise.options.filter((option) => !option.correct).every((option) =>
      Array.isArray(exercise.optionErrorTags[option.id])
    );
}

function roleMatches(part, expectedRole, expectedChar) {
  const acceptedRoles = expectedRole === "semantic"
    ? new Set(["semantic", "mixed"])
    : new Set(["phonetic", "mixed"]);
  return acceptedRoles.has(part.role)
    && (part.char === expectedChar || part.normalizedChar === expectedChar);
}

function normalizedMeaning(value) {
  return String(value || "")
    .replace(/[“”‘’「」『』，、。；：！？,.!?;:\s]/gu, "")
    .replace(/(?:表示|意思是|指的是|本义是|在这里|这个词)/gu, "");
}

function meaningBigrams(value) {
  const glyphs = Array.from(value);
  return new Set(glyphs.slice(0, -1).map((glyph, index) => glyph + glyphs[index + 1]));
}

function meaningsConflict(correct, candidate) {
  const left = normalizedMeaning(correct);
  const right = normalizedMeaning(candidate);
  if (!left || !right || left.includes(right) || right.includes(left)) return true;
  if (meaningSynonymGroups.some((group) =>
    group.some((term) => left.includes(term))
    && group.some((term) => right.includes(term))
  )) return true;
  const leftBigrams = meaningBigrams(left);
  const rightBigrams = meaningBigrams(right);
  const overlap = [...leftBigrams].filter((item) => rightBigrams.has(item)).length;
  const denominator = Math.min(leftBigrams.size, rightBigrams.size);
  return denominator > 0 && overlap / denominator >= 0.5;
}

export function validateLearningContent(options = {}) {
  const strictExtensions = options.strictExtensions === true;
  const official = [...grade5Characters];
  const extensions = [...grade5ExtensionCharacters];
  const all = [...official, ...extensions];
  const errors = [];
  const warnings = [];
  let semanticGoldRecords = 0;
  let semanticTargetLeakRecords = 0;
  let semanticClassMismatchRecords = 0;
  let semanticUniqueLongestRecords = 0;
  let semanticLengthOutlierRecords = 0;

  if (all.length !== 430) errors.push("expected 430 total records, found " + all.length);
  if (official.length !== 365) errors.push("expected 365 official records, found " + official.length);
  if (extensions.length !== 65) errors.push("expected 65 extension records, found " + extensions.length);
  const semanticGoldEntries = Object.entries(grade5SemanticGold);
  if (semanticGoldEntries.length !== 426) {
    errors.push("expected 426 unique glyph|word semantic gold entries, found " + semanticGoldEntries.length);
  }
  const wordSenseGroups = new Map();
  for (const [key, entry] of semanticGoldEntries) {
    const word = key.slice(key.indexOf("|") + 1);
    const group = wordSenseGroups.get(word) || [];
    group.push(entry);
    wordSenseGroups.set(word, group);
  }
  for (const [word, entries] of wordSenseGroups) {
    if (new Set(entries.map((entry) => entry.wordSenseKey)).size !== 1
      || new Set(entries.map((entry) => entry.dictionaryGloss)).size !== 1) {
      errors.push("same lesson word is not bound to one core sense: " + word);
    }
  }

  for (const item of all) {
    if (!item.id || !item.hanzi || !Array.isArray(item.parts) || !item.parts.length) {
      errors.push("invalid base record shape: " + (item.id || item.hanzi || "unknown"));
    }
    if (!Array.isArray(item.exercises) || !item.exercises.length) {
      errors.push("record has no exercises: " + item.id);
    }
  }

  for (const item of all) {
    for (const part of item.parts) {
      if (!validPartMetadata(part)) {
        errors.push("missing component-role evidence: " + item.id + " / " + part.char);
      }
    }
    for (const exercise of item.exercises) {
      if (!validExerciseMetadata(exercise)) {
        errors.push("missing exercise learning metadata: " + item.id + " / " + exercise.id);
      }
    }
    if (item.charType.includes("形声")
      && (!item.description.includes("声旁只提供")
        || !item.description.includes("词语核实"))) {
      errors.push("pictophonetic caveat missing: " + item.id);
    }
    if (item.charType.includes("形声")
      && !item.parts.some((part) => part.role === "phonetic" || part.role === "mixed")) {
      errors.push("pictophonetic label has no visible sound component: " + item.id);
    }
    if (item.charType === "会意字" && !item.description.includes("共同会意")) {
      errors.push("ideographic label lacks an explicit joint-meaning explanation: " + item.id);
    }
    if (item.exercises.some((exercise) => exercise.questionType === "write_full_word_empty")) {
      const recall = item.exercises.find((exercise) =>
        exercise.questionType === "write_full_word_empty"
      );
      if (!recall) {
        errors.push("writing record lacks recall writing: " + item.id);
      } else {
        if (recall.concealTarget !== true || recall.cueLevel !== 0) {
          errors.push("recall writing is not independently concealed: " + item.id);
        }
        if (!recall.spokenPrompt || recall.spokenPrompt.includes(item.hanzi)) {
          errors.push("spoken recall prompt leaks target: " + item.id);
        }
        if (recall.prompt.includes(item.hanzi)) {
          errors.push("visible recall prompt leaks target: " + item.id);
        }
      }
    }
    const coveredDimensions = new Set(item.exercises.map((exercise) => exercise.dimension));
    for (const dimension of skillDimensions) {
      if (!coveredDimensions.has(dimension)) {
        errors.push("missing real exercise dimension " + dimension + ": " + item.id);
      }
    }
    const reverseRecognition = item.exercises.find((exercise) =>
      exercise.dimension === "recognition"
      && exercise.cueLevel === 0
      && (
        exercise.id.endsWith("-science-recognition")
        || exercise.id.endsWith("-words-context")
      )
    );
    if (!reverseRecognition || reverseRecognition.prompt.includes(item.hanzi)) {
      errors.push("independent reverse-recognition cue leaks or is missing: " + item.id);
    }
    const contextTransfer = item.exercises.find((exercise) =>
      exercise.dimension === "context"
      && exercise.id.endsWith("-science-context")
    );
    if (!contextTransfer
      || contextTransfer.prompt.includes(item.hanzi)
      || contextTransfer.prompt.includes("本课哪个词")
      || (contextTransfer.prompt.match(/□/gu) || []).length !== 1) {
      errors.push("new-sentence context transfer leaks or is missing: " + item.id);
    }
    const semantics = item.exercises.find((exercise) =>
      exercise.dimension === "semantics"
      && exercise.id.endsWith("-science-semantics")
    );
    const correctMeaning = semantics?.options.find((option) => option.correct)?.text || "";
    const conflictingWrongMeaning = semantics?.options.find((option) =>
      !option.correct && meaningsConflict(correctMeaning, option.text)
    );
    if (!semantics || !correctMeaning || conflictingWrongMeaning) {
      errors.push(
        "semantic option is missing or conflicts with a wrong option: "
        + item.id
        + (conflictingWrongMeaning ? " / " + conflictingWrongMeaning.text : ""),
      );
    }
    const semanticGoldKey = `${item.hanzi}|${item.word}`;
    const semanticGold = grade5SemanticGold[semanticGoldKey];
    if (!semanticGold
      || semanticGold.senseReviewed !== true
      || !semanticGold.senseSource
      || semanticGold.wordSenseKey !== `lesson-word:${item.word}`) {
      errors.push("missing independently reviewed lesson-word semantic gold: " + item.id);
    } else {
      semanticGoldRecords += 1;
      if (correctMeaning !== semanticGold.option
        || semantics.semanticGoldKey !== semanticGoldKey
        || semantics.semanticGoldSource !== "frozen-lesson-word-gold") {
        errors.push("runtime semantics diverge from frozen gold: " + item.id);
      }
      if (semantics.semanticClass !== semanticGold.semanticClass
        || semantics.semanticForm !== semanticGold.semanticForm
        || semantics.semanticDistractorSource !== "explicit-class-bank"
        || semantics.options.some((option) =>
          semantics.optionSemanticClasses?.[option.text] !== semanticGold.semanticClass
        )) {
        semanticClassMismatchRecords += 1;
        errors.push("semantic class/form or explicit-bank evidence mismatches gold: " + item.id);
      }
      if (disallowedSemanticRhetoric.test(correctMeaning)
        && !semanticGold.allowedTeachingTerms?.some((term) => correctMeaning.includes(term))) {
        errors.push("semantic correct option contains teaching rhetoric: " + item.id);
      }
    }
    if (semantics?.options.some((option) =>
      option.text.includes(item.hanzi) || option.text.includes(item.word)
    )) {
      semanticTargetLeakRecords += 1;
      errors.push("semantic option leaks target glyph or lesson word: " + item.id);
    }
    if (semantics && correctMeaning) {
      const correctLength = Array.from(correctMeaning).length;
      const wrongLengths = semantics.options
        .filter((option) => !option.correct)
        .map((option) => Array.from(option.text).length);
      if (correctLength > Math.max(...wrongLengths)) {
        semanticUniqueLongestRecords += 1;
        errors.push("semantic correct option is uniquely longest: " + item.id);
      }
      const lengthThreshold = Math.max(4, Math.ceil(correctLength * 0.5));
      if (wrongLengths.some((length) => Math.abs(length - correctLength) > lengthThreshold)) {
        semanticLengthOutlierRecords += 1;
        errors.push("semantic distractor length is an outlier: " + item.id);
      }
    }
    if (semantics && semantics.options.some((option) =>
      option.text.includes(item.hanzi) || option.text.includes(item.word)
    )) {
      errors.push("semantic option leaks target glyph or word: " + item.id);
    }
    if (semantics && (
      !semantics.semanticClass
      || !semantics.semanticForm
      || !semantics.optionSemanticClasses
      || semantics.options.some((option) =>
        semantics.optionSemanticClasses[option.text] !== semantics.semanticClass
      )
    )) {
      errors.push("semantic options are not in one explicit class and form: " + item.id);
    }
    const confusionDiscrimination = item.exercises.find((exercise) =>
      exercise.dimension === "discrimination"
      && exercise.id.endsWith("-science-discrimination")
    );
    const taggedConfusionOptions = confusionDiscrimination?.options.filter((option) =>
      !option.correct
      && confusionDiscrimination.optionErrorTags?.[option.id]?.some((tag) =>
        tag === "homophone-confusion" || tag === "lookalike-confusion"
      )
    ) || [];
    if (!confusionDiscrimination
      || confusionDiscrimination.cueLevel !== 0
      || confusionDiscrimination.concealTarget !== true
      || confusionDiscrimination.prompt.includes(item.hanzi)
      || (confusionDiscrimination.prompt.match(/□/gu) || []).length !== 1
      || taggedConfusionOptions.length < 2) {
      errors.push("cue-free glyph-confusion discrimination is missing or weak: " + item.id);
    }
    const recallWriting = item.exercises.some((exercise) =>
      exercise.questionType === "write_full_word_empty"
    );
    const independentGeneration = item.exercises.find((exercise) =>
      exercise.dimension === "generation"
      && exercise.id.endsWith("-science-generation")
    );
    if (!independentGeneration
      || independentGeneration.cueLevel !== 0
      || independentGeneration.answerMode !== "choice"
      || independentGeneration.concealTarget !== true
      || independentGeneration.prompt.includes(item.hanzi)
      || independentGeneration.options.some((option) => option.text.includes(item.hanzi))) {
      errors.push("record lacks target-hidden objective generation: " + item.id);
    }
    if (recallWriting && !item.exercises.some((exercise) =>
      exercise.kind === "write" && exercise.concealTarget !== true
    )) {
      errors.push("writing record lacks its guided motor-writing pass: " + item.id);
    }
  }

  for (const [hanzi, expected] of Object.entries(roleConsistencyCases)) {
    const occurrences = official.filter((item) => item.hanzi === hanzi);
    if (!occurrences.length) {
      errors.push("consistency case absent from official catalog: " + hanzi);
      continue;
    }
    for (const item of occurrences) {
      for (const [expectedRole, expectedChar] of Object.entries(expected)) {
        if (!item.parts.some((part) => roleMatches(part, expectedRole, expectedChar))) {
          errors.push(
            "wrong " + expectedRole + " component for " + item.id + ": expected " + expectedChar,
          );
        }
      }
    }
  }

  const extensionPartGaps = extensions.reduce(
    (count, item) => count + item.parts.filter((part) => !validPartMetadata(part)).length,
    0,
  );
  const extensionExerciseGaps = extensions.reduce(
    (count, item) => count + item.exercises.filter((exercise) => !validExerciseMetadata(exercise)).length,
    0,
  );
  const extensionRecallLeaks = extensions.reduce((count, item) =>
    count + item.exercises.filter((exercise) =>
      exercise.questionType === "write_full_word_empty"
      && (
        exercise.concealTarget !== true
        || !exercise.spokenPrompt
        || exercise.spokenPrompt.includes(item.hanzi)
        || exercise.prompt.includes(item.hanzi)
      )
    ).length, 0);
  const extensionReports = [
    extensionPartGaps
      ? extensionPartGaps + " extension parts still use the legacy role-less shape"
      : "",
    extensionExerciseGaps
      ? extensionExerciseGaps + " extension exercises still lack learning metadata"
      : "",
    extensionRecallLeaks
      ? extensionRecallLeaks + " extension recall-writing exercises still need concealment authoring"
      : "",
  ].filter(Boolean);
  (strictExtensions ? errors : warnings).push(...extensionReports);

  const officialExercises = official.flatMap((item) => item.exercises);
  const officialParts = official.flatMap((item) => item.parts);
  const officialRecall = officialExercises.filter((exercise) =>
    exercise.questionType === "write_full_word_empty"
  );
  const allExercises = all.flatMap((item) => item.exercises);
  const allParts = all.flatMap((item) => item.parts);
  const allRecall = allExercises.filter((exercise) =>
    exercise.questionType === "write_full_word_empty"
  );
  const pictophonetic = all.filter((item) => item.charType.includes("形声"));
  const dimensionCoverage = Object.fromEntries(
    [...skillDimensions].map((dimension) => [
      dimension,
      all.filter((item) =>
        item.exercises.some((exercise) => exercise.dimension === dimension)
      ).length,
    ]),
  );
  const recordsWithSixDimensions = all.filter((item) =>
    [...skillDimensions].every((dimension) =>
      item.exercises.some((exercise) => exercise.dimension === dimension)
    )
  ).length;
  const confusionDiscriminationRecords = all.filter((item) =>
    item.exercises.some((exercise) =>
      exercise.dimension === "discrimination"
      && exercise.id.endsWith("-science-discrimination")
      && exercise.cueLevel === 0
    )
  ).length;
  const independentGenerationRecords = all.filter((item) =>
    item.exercises.some((exercise) =>
      exercise.dimension === "generation"
      && exercise.id.endsWith("-science-generation")
      && exercise.cueLevel === 0
      && exercise.answerMode === "choice"
      && exercise.concealTarget === true
    )
  ).length;
  return {
    errors,
    warnings,
    stats: {
      records: all.length,
      officialRecords: official.length,
      extensionRecords: extensions.length,
      allParts: allParts.length,
      allPartsWithRoleMetadata: allParts.filter(validPartMetadata).length,
      allExercises: allExercises.length,
      allExercisesWithLearningMetadata: allExercises.filter(validExerciseMetadata).length,
      officialParts: officialParts.length,
      officialPartsWithRoleMetadata: officialParts.filter(validPartMetadata).length,
      officialExercises: officialExercises.length,
      officialExercisesWithLearningMetadata: officialExercises.filter(validExerciseMetadata).length,
      officialRecallWriting: officialRecall.length,
      concealedOfficialRecallWriting: officialRecall.filter((exercise) =>
        exercise.concealTarget === true
      ).length,
      allRecallWriting: allRecall.length,
      concealedAllRecallWriting: allRecall.filter((exercise) =>
        exercise.concealTarget === true
      ).length,
      pictophoneticRecords: pictophonetic.length,
      pictophoneticRecordsWithCaveat: pictophonetic.filter((item) =>
        item.description.includes("声旁只提供")
        && item.description.includes("词语核实")
      ).length,
      extensionPartGaps,
      extensionExerciseGaps,
      extensionRecallLeaks,
      dimensionCoverage,
      recordsWithSixDimensions,
      confusionDiscriminationRecords,
      independentGenerationRecords,
      semanticGoldRecords,
      semanticTargetLeakRecords,
      semanticClassMismatchRecords,
      semanticUniqueLongestRecords,
      semanticLengthOutlierRecords,
    },
  };
}

function printReport(report) {
  const stats = report.stats;
  process.stdout.write([
    "Learning content validation",
    "  records: " + stats.records + " (official " + stats.officialRecords + ", extension " + stats.extensionRecords + ")",
    "  all part metadata: " + stats.allPartsWithRoleMetadata + "/" + stats.allParts,
    "  all exercise metadata: " + stats.allExercisesWithLearningMetadata + "/" + stats.allExercises,
    "  six-dimension records: " + stats.recordsWithSixDimensions + "/" + stats.records,
    "  cue-free confusion discrimination: " + stats.confusionDiscriminationRecords + "/" + stats.records,
    "  objective independent generation: " + stats.independentGenerationRecords + "/" + stats.records,
    "  independently reviewed semantic gold: " + stats.semanticGoldRecords + "/" + stats.records,
    "  semantic target leaks/class mismatches: " + stats.semanticTargetLeakRecords + "/" + stats.semanticClassMismatchRecords,
    "  semantic unique-longest/length-outlier: " + stats.semanticUniqueLongestRecords + "/" + stats.semanticLengthOutlierRecords,
    "  dimension coverage: " + Object.entries(stats.dimensionCoverage).map(([key, value]) => key + " " + value).join(", "),
    "  concealed recall writing: " + stats.concealedAllRecallWriting + "/" + stats.allRecallWriting,
    "  pictophonetic caveats: " + stats.pictophoneticRecordsWithCaveat + "/" + stats.pictophoneticRecords,
    "  errors: " + report.errors.length,
    "  extension reports: " + report.warnings.length,
    ...report.errors.map((message) => "ERROR " + message),
    ...report.warnings.map((message) => "REPORT " + message),
  ].join("\n") + "\n");
}

const entryUrl = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (entryUrl === import.meta.url) {
  const report = validateLearningContent({
    strictExtensions: process.argv.includes("--strict-extensions"),
  });
  printReport(report);
  if (report.errors.length) process.exitCode = 1;
}
