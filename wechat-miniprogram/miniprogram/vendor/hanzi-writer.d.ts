declare namespace HanziWriter {
  type CharacterData = {
    strokes: string[];
    medians: number[][][];
    radStrokes?: number[];
  };

  type StrokeData = {
    character: string;
    isBackwards: boolean;
    strokeNum: number;
    mistakesOnStroke: number;
    totalMistakes: number;
    strokesRemaining: number;
  };

  type Instance = {
    target: {
      emitTouchStart(x: number, y: number): void;
      emitTouchMove(x: number, y: number): void;
      emitTouchEnd(): void;
    };
    quiz(options: {
      leniency?: number;
      averageDistanceThreshold?: number;
      showHintAfterMisses?: number | false;
      highlightOnComplete?: boolean;
      acceptBackwardsStrokes?: boolean;
      markStrokeCorrectAfterMisses?: number | false;
      onMistake?: (data: StrokeData) => void;
      onCorrectStroke?: (data: StrokeData) => void;
      onComplete?: (summary: { character: string; totalMistakes: number }) => void;
    }): Promise<unknown>;
    cancelQuiz(): void;
  };
}

declare const HanziWriter: {
  create(
    canvas: unknown,
    character: string,
    options: Record<string, unknown>,
  ): HanziWriter.Instance;
};

export = HanziWriter;
