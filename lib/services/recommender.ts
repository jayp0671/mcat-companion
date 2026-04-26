export type TopicPriorityInput = {
  id: string;
  mastery: number;
  attempts?: number;
  attemptsCount?: number;
  importanceWeight?: number;
  daysSincePracticed?: number;
};

export function topicPriority(topic: TopicPriorityInput): number {
  if (topic.mastery >= 60) return 0;

  const attempts = topic.attempts ?? topic.attemptsCount ?? 0;
  const weaknessSignal = (60 - topic.mastery) / 60;
  const importanceWeight = topic.importanceWeight ?? 1;
  const coverageGap = 1 / (attempts + 1);

  // Higher priority if the student has not practiced this recently.
  const daysSincePracticed = topic.daysSincePracticed ?? 14;
  const recencyBoost = 1 - Math.exp(-Math.max(daysSincePracticed, 0) / 14);

  return weaknessSignal * importanceWeight * coverageGap * (1 + recencyBoost);
}

export function rankTopics<T extends TopicPriorityInput>(topics: T[]): T[] {
  return [...topics].sort((a, b) => topicPriority(b) - topicPriority(a));
}
