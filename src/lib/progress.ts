export type TopicProgressFlags = {
  readDone: boolean;
  lectureDone: boolean;
  solvedDone: boolean;
};

const CHECKS_PER_TOPIC = 3;

export type ProgressTopicInput = {
  id: string;
};

export type ProgressChapterInput = {
  id: string;
  examWeight: number;
  topics: ProgressTopicInput[];
};

export function computeChapterProgress(
  topics: ProgressTopicInput[],
  progressByTopicId: ReadonlyMap<string, TopicProgressFlags>
): number {
  if (topics.length === 0) return 0;

  let checked = 0;
  for (const topic of topics) {
    const flags = progressByTopicId.get(topic.id);
    if (!flags) continue;
    if (flags.readDone) checked++;
    if (flags.lectureDone) checked++;
    if (flags.solvedDone) checked++;
  }

  const total = topics.length * CHECKS_PER_TOPIC;
  return round1((checked / total) * 100);
}

export function computeSubjectProgress(
  chapters: ProgressChapterInput[],
  progressByTopicId: ReadonlyMap<string, TopicProgressFlags>
): number {
  if (chapters.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const chapter of chapters) {
    const chapterPct = computeChapterProgress(chapter.topics, progressByTopicId);
    weightedSum += chapterPct * chapter.examWeight;
    totalWeight += chapter.examWeight;
  }

  if (totalWeight === 0) return 0;
  return round1(weightedSum / totalWeight);
}

export function buildTopicProgressMap<
  T extends { topicId: string; readDone: boolean; lectureDone: boolean; solvedDone: boolean },
>(rows: T[]): Map<string, TopicProgressFlags> {
  const map = new Map<string, TopicProgressFlags>();
  for (const row of rows) {
    map.set(row.topicId, {
      readDone: row.readDone,
      lectureDone: row.lectureDone,
      solvedDone: row.solvedDone,
    });
  }
  return map;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
