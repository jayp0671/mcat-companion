export type MasteryAttempt = {
  isCorrect: boolean;
  difficulty: number;
  attemptedAt: Date | string;
};

export type MasteryResult = {
  score: number;
  confidence: number;
  attempts: number;
};

export function recencyWeight(attemptedAt: Date | string, now = new Date()): number {
  const attempted = new Date(attemptedAt);
  const daysSinceAttempt =
    (now.getTime() - attempted.getTime()) / (1000 * 60 * 60 * 24);

  return Math.exp(-Math.max(daysSinceAttempt, 0) / 30);
}

export function difficultyWeight(difficulty: number): number {
  const clamped = Math.min(Math.max(difficulty, 1), 5);
  return 0.6 + 0.2 * clamped;
}

export function masteryScore(attempts: MasteryAttempt[], now = new Date()): MasteryResult {
  if (attempts.length === 0) {
    return {
      score: 0,
      confidence: 0,
      attempts: 0,
    };
  }

  let weightedCorrect = 0;
  let totalWeight = 0;

  for (const attempt of attempts) {
    const weight =
      recencyWeight(attempt.attemptedAt, now) *
      difficultyWeight(attempt.difficulty);

    totalWeight += weight;
    weightedCorrect += attempt.isCorrect ? weight : 0;
  }

  const score = totalWeight === 0 ? 0 : (weightedCorrect / totalWeight) * 100;
  const confidence = 1 - Math.exp(-attempts.length / 5);

  return {
    score,
    confidence,
    attempts: attempts.length,
  };
}

export function isWeak(mastery: number, confidence: number, attempts: number): boolean {
  return mastery < 60 && confidence > 0.4 && attempts >= 3;
}
