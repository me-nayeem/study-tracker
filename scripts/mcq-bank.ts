/**
 * The MCQ question bank shared by the import scripts:
 * - context/mcq/data2_clean/task*\/questions.json (the cleaned bank)
 * - context/mcq/extra/*.json (questions added by hand, same shape; id/status/type optional)
 * - context/mcq/overrides.json (optional): { "exclude": { id: reason },
 *   "optionText": { id: { optionId: text } }, "topic": { id: topicTag } } for fixing bank
 *   questions without editing them
 */
import fs from "node:fs";
import path from "node:path";

const BANK_DIR = "context/mcq/data2_clean";
const EXTRA_DIR = "context/mcq/extra";
const OVERRIDES_FILE = "context/mcq/overrides.json";

type Overrides = {
  exclude?: Record<string, string>;
  optionText?: Record<string, Record<string, string>>;
  topic?: Record<string, string>;
};

export type BankQuestion = {
  id: string;
  status: string;
  type: string;
  exam_year?: string;
  university?: string;
  chapter_id: string;
  topic_id?: string;
  question: { text: string; images: unknown[] };
  options: { id: string; text: string | null; image: unknown }[];
  correct_option_id: string;
  explanation?: { text?: string | null } | null;
};

export function loadBank(): BankQuestion[] {
  const questions: BankQuestion[] = [];

  for (const dir of fs
    .readdirSync(BANK_DIR)
    .filter((d) => d.startsWith("task"))
    .sort()) {
    const file = path.join(BANK_DIR, dir, "questions.json");
    if (fs.existsSync(file)) questions.push(...JSON.parse(fs.readFileSync(file, "utf8")));
  }

  if (fs.existsSync(EXTRA_DIR)) {
    for (const name of fs
      .readdirSync(EXTRA_DIR)
      .filter((f) => f.endsWith(".json"))
      .sort()) {
      const extra: Partial<BankQuestion>[] = JSON.parse(
        fs.readFileSync(path.join(EXTRA_DIR, name), "utf8")
      );
      extra.forEach((q, i) =>
        questions.push({
          ...q,
          id: q.id ?? `EXTRA-${path.basename(name, ".json")}-${String(i + 1).padStart(3, "0")}`,
          status: q.status ?? "published",
          type: q.type ?? "single_choice",
        } as BankQuestion)
      );
    }
  }

  if (!fs.existsSync(OVERRIDES_FILE)) return questions;
  const overrides: Overrides = JSON.parse(fs.readFileSync(OVERRIDES_FILE, "utf8"));
  return questions
    .filter((q) => !overrides.exclude?.[q.id])
    .map((q) => {
      const fixes = overrides.optionText?.[q.id];
      const topic = overrides.topic?.[q.id];
      return {
        ...q,
        topic_id: topic ?? q.topic_id,
        options: fixes ? q.options.map((o) => ({ ...o, text: fixes[o.id] ?? o.text })) : q.options,
      };
    });
}
