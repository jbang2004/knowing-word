import type { ErrorTag, SkillDimension } from "./learning-state.ts";

export const remediationActivities = [
  "pronunciation-contrast",
  "meaning-retrieval",
  "semantic-component-review",
  "phonetic-component-review",
  "component-rebuild",
  "guided-rewrite",
  "homophone-contrast",
  "lookalike-contrast",
  "context-transfer",
  "writing-self-check",
] as const;

export type RemediationActivity = typeof remediationActivities[number];

export type ErrorDiagnosis = {
  tag: ErrorTag;
  targetDimension: SkillDimension;
  activity: RemediationActivity;
};

export type RemediationGuidance = {
  activity: RemediationActivity;
  targetDimension: SkillDimension;
  title: string;
  instruction: string;
};

export const errorDiagnosisByTag = {
  "pronunciation-initial": {
    targetDimension: "phonology",
    activity: "pronunciation-contrast",
  },
  "pronunciation-final": {
    targetDimension: "phonology",
    activity: "pronunciation-contrast",
  },
  "pronunciation-tone": {
    targetDimension: "phonology",
    activity: "pronunciation-contrast",
  },
  "meaning-unknown": {
    targetDimension: "semantics",
    activity: "meaning-retrieval",
  },
  "semantic-component": {
    targetDimension: "semantics",
    activity: "semantic-component-review",
  },
  "phonetic-component": {
    targetDimension: "phonology",
    activity: "phonetic-component-review",
  },
  "component-missing": {
    targetDimension: "generation",
    activity: "component-rebuild",
  },
  "component-extra": {
    targetDimension: "generation",
    activity: "component-rebuild",
  },
  "component-position": {
    targetDimension: "generation",
    activity: "component-rebuild",
  },
  "stroke-missing": {
    targetDimension: "generation",
    activity: "guided-rewrite",
  },
  "stroke-extra": {
    targetDimension: "generation",
    activity: "guided-rewrite",
  },
  "homophone-confusion": {
    targetDimension: "discrimination",
    activity: "homophone-contrast",
  },
  "lookalike-confusion": {
    targetDimension: "discrimination",
    activity: "lookalike-contrast",
  },
  "context-misuse": {
    targetDimension: "context",
    activity: "context-transfer",
  },
  "writing-unverified": {
    targetDimension: "generation",
    activity: "writing-self-check",
  },
} as const satisfies Record<
  ErrorTag,
  Omit<ErrorDiagnosis, "tag">
>;

export function diagnoseError(tag: ErrorTag): ErrorDiagnosis {
  return { tag, ...errorDiagnosisByTag[tag] };
}

export function diagnoseErrors(tags: readonly ErrorTag[]) {
  return [...new Set(tags)].map(diagnoseError);
}

const remediationCopy: Record<
  RemediationActivity,
  Pick<RemediationGuidance, "title" | "instruction">
> = {
  "pronunciation-contrast": {
    title: "先把字音分清",
    instruction: "对照声母、韵母和声调，跟读一次常用词，再遮住拼音独立读。",
  },
  "meaning-retrieval": {
    title: "回到词义线索",
    instruction: "先说出熟悉词语的大意，再遮住答案，用这个字重新组一个词。",
  },
  "semantic-component-review": {
    title: "看清表义部件",
    instruction: "找出提示意义类别的部件，说出它为什么适合这个词义，再重新选择。",
  },
  "phonetic-component-review": {
    title: "核实声旁线索",
    instruction: "用声旁猜一个大致读音，再回到词语核实；声旁只是概率线索，不保证同音同调。",
  },
  "component-rebuild": {
    title: "重新搭一次字形",
    instruction: "看清缺少、多出或放错位置的部件，说出结构后，收起答案重新组合。",
  },
  "guided-rewrite": {
    title: "只改错的笔画",
    instruction: "圈出漏笔或多笔，沿正确字形空书一次，然后遮住范字重新写。",
  },
  "homophone-contrast": {
    title: "用词义分开同音字",
    instruction: "比较两个字的表义部件和代表词，把它们分别放进一句话后再选。",
  },
  "lookalike-contrast": {
    title: "找到形近字的不同处",
    instruction: "只比较不同的部件或位置，说出差别，再遮住答案重新辨认。",
  },
  "context-transfer": {
    title: "放回新句子判断",
    instruction: "先读完整句意，再用字义和搭配排除不合适的字，不靠字卡位置猜。",
  },
  "writing-self-check": {
    title: "按部件逐项自查",
    instruction: "依次检查部件、位置和笔画；不能确认时不记为答对，先对照再重写。",
  },
};

/** Return one actionable correction tied to the recorded cause. */
export function remediationGuidanceFor(
  tags: readonly ErrorTag[],
): RemediationGuidance | null {
  const diagnosis = diagnoseErrors(tags)[0];
  if (!diagnosis) return null;
  return {
    activity: diagnosis.activity,
    targetDimension: diagnosis.targetDimension,
    ...remediationCopy[diagnosis.activity],
  };
}
