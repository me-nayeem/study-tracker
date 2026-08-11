import { z } from "zod";

export const TOPIC_PROGRESS_FIELDS = ["readDone", "lectureDone", "solvedDone"] as const;
export type TopicProgressField = (typeof TOPIC_PROGRESS_FIELDS)[number];

export const ToggleTopicProgressSchema = z.object({
  topicId: z.string().min(1, "Missing id."),
  field: z.enum(TOPIC_PROGRESS_FIELDS),
  value: z.enum(["true", "false"]).transform((v) => v === "true"),
});
