export type TopicSignal = { id: string; mastery: number; attempts: number; daysSincePracticed: number; importanceWeight?: number };
export function topicPriority(topic: TopicSignal) {
  const weaknessSignal = topic.mastery < 60 ? (60 - topic.mastery) / 60 : 0;
  const importance = topic.importanceWeight ?? 1;
  const coverageGap = 1 / (topic.attempts + 1);
  const recencyPenalty = Math.exp(-topic.daysSincePracticed / 14);
  return weaknessSignal * importance * coverageGap * recencyPenalty;
}
export function rankTopics(topics: TopicSignal[]) { return [...topics].sort((a, b) => topicPriority(b) - topicPriority(a)); }
