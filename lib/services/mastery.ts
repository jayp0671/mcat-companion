export type Attempt = { correct: boolean; difficulty: number; attemptedAt: Date };
export function recencyWeight(attemptedAt: Date, now = new Date()) {
  const days = Math.max(0, (now.getTime() - attemptedAt.getTime()) / 86_400_000);
  return Math.exp(-days / 30);
}
export function difficultyWeight(difficulty: number) { return 0.6 + 0.2 * difficulty; }
export function confidenceForAttempts(attempts: number) { return 1 - Math.exp(-attempts / 5); }
export function masteryScore(attempts: Attempt[], now = new Date()) {
  if (!attempts.length) return { score: 0, confidence: 0, attempts: 0 };
  const weighted = attempts.map((a) => recencyWeight(a.attemptedAt, now) * difficultyWeight(a.difficulty));
  const numerator = attempts.reduce((sum, a, i) => sum + weighted[i] * (a.correct ? 1 : 0), 0);
  const denominator = weighted.reduce((sum, w) => sum + w, 0);
  return { score: Math.round((100 * numerator / denominator) * 10) / 10, confidence: confidenceForAttempts(attempts.length), attempts: attempts.length };
}
export function isWeak(score: number, confidence: number, attempts: number) {
  return score < 60 && confidence > 0.4 && attempts >= 3;
}
