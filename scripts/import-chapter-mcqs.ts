/**
 * Builds each chapter's completion quiz (20 MCQs) from the cleaned question bank in
 * context/mcq/data2_clean/task*\/questions.json.
 *
 * Usage:
 *   npx tsx scripts/import-chapter-mcqs.ts                 # dry run: report + preview file
 *   npx tsx scripts/import-chapter-mcqs.ts --apply         # write to the database
 *   npx tsx scripts/import-chapter-mcqs.ts --apply --only <chapterId,chapterId>
 *   npx tsx scripts/import-chapter-mcqs.ts --preview <file> # where to write the dry-run preview
 *   npx tsx scripts/import-chapter-mcqs.ts --min 15        # also build smaller quizzes (15–19)
 *
 * Rules:
 * - only published single-choice questions without images (the quiz has no image support),
 *   3–5 non-empty, distinct options and a valid correct option
 * - duplicates (same question text) are dropped
 * - picks spread across the chapter's topics; the pick is deterministic, so re-running the
 *   dry run shows the same 20
 * - a chapter that already has an active quiz with questions is never touched, so the
 *   script is safe to re-run; each chapter is written in its own transaction
 * - chapters with fewer than --min (default 20) usable questions are reported and skipped;
 *   between --min and 20 the quiz gets every usable question
 *
 * Needs DIRECT_URL (or DATABASE_URL) in .env.
 */
import "dotenv/config";
import fs from "node:fs";
import crypto from "node:crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CHAPTER_MAP } from "./mcq-chapter-map";
import { loadBank, type BankQuestion } from "./mcq-bank";

const QUESTIONS_PER_QUIZ = 20;
const QUIZ_TITLE = "Validation quiz";
const TIME_LIMIT_MINUTES = 20;

type Picked = {
  sourceId: string;
  topic: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
};

function parseArgs(argv: string[]) {
  const args = {
    apply: false,
    only: null as string[] | null,
    preview: "",
    min: QUESTIONS_PER_QUIZ,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--apply") args.apply = true;
    else if (argv[i] === "--only") args.only = argv[++i].split(",").map((s) => s.trim());
    else if (argv[i] === "--preview") args.preview = argv[++i];
    else if (argv[i] === "--min") args.min = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return args;
}

/** Why a question can't be used, or null when it's fine. */
function rejectReason(q: BankQuestion): string | null {
  if (q.status !== "published") return "not published";
  if (q.type !== "single_choice") return "not single choice";
  if (q.question.images.length > 0 || q.options.some((o) => o.image)) return "has image";
  if (!q.question.text.trim()) return "empty question";
  if (q.options.length < 3 || q.options.length > 5) return "option count";
  const texts = q.options.map((o) => (o.text ?? "").trim());
  if (texts.some((t) => !t)) return "empty option";
  if (new Set(texts).size !== texts.length) return "duplicate options";
  if (!q.options.some((o) => o.id === q.correct_option_id)) return "no correct option";
  return null;
}

const normalize = (text: string) => text.replace(/[\s।?.,:;!'"“”‘’()-]+/g, "").toLowerCase();
const hash = (value: string) => crypto.createHash("sha1").update(value).digest("hex");

/** 20 questions spread round-robin over the chapter's topics; explained questions first. */
function pick(candidates: BankQuestion[]): BankQuestion[] {
  const byTopic = new Map<string, BankQuestion[]>();
  for (const q of candidates) {
    const topic = q.topic_id ?? q.chapter_id;
    byTopic.set(topic, [...(byTopic.get(topic) ?? []), q]);
  }
  const queues = [...byTopic.entries()]
    .sort(([a], [b]) => hash(a).localeCompare(hash(b)))
    .map(([, qs]) =>
      qs.sort(
        (a, b) =>
          Number(!a.explanation?.text) - Number(!b.explanation?.text) ||
          hash(a.id).localeCompare(hash(b.id))
      )
    );

  const picked: BankQuestion[] = [];
  while (picked.length < QUESTIONS_PER_QUIZ && queues.some((q) => q.length)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next) picked.push(next);
      if (picked.length === QUESTIONS_PER_QUIZ) break;
    }
  }
  return picked;
}

function toQuizQuestion(q: BankQuestion): Picked {
  return {
    sourceId: q.id,
    topic: q.topic_id ?? q.chapter_id,
    questionText: q.question.text.trim(),
    options: q.options.map((o) => (o.text ?? "").trim()),
    correctIndex: q.options.findIndex((o) => o.id === q.correct_option_id),
    explanation: q.explanation?.text?.trim() || null,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    }),
  });

  try {
    const bank = loadBank();
    const rejected = new Map<string, number>();
    const usableByTag = new Map<string, BankQuestion[]>();
    const seenText = new Map<string, Set<string>>();

    for (const q of bank) {
      if (!(q.chapter_id in CHAPTER_MAP)) continue;
      const reason = rejectReason(q);
      if (reason) {
        rejected.set(reason, (rejected.get(reason) ?? 0) + 1);
        continue;
      }
      const seen = seenText.get(q.chapter_id) ?? new Set<string>();
      const key = normalize(q.question.text);
      if (seen.has(key)) {
        rejected.set("duplicate question", (rejected.get("duplicate question") ?? 0) + 1);
        continue;
      }
      seen.add(key);
      seenText.set(q.chapter_id, seen);
      usableByTag.set(q.chapter_id, [...(usableByTag.get(q.chapter_id) ?? []), q]);
    }

    const chapters = await prisma.chapter.findMany({
      where: { id: { in: Object.values(CHAPTER_MAP) } },
      select: {
        id: true,
        name: true,
        isArchived: true,
        paper: { select: { name: true, subject: { select: { name: true } } } },
        quizzes: {
          where: { isActive: true },
          select: { id: true, _count: { select: { questions: true } } },
        },
      },
    });
    const chapterById = new Map(chapters.map((c) => [c.id, c]));

    const toCreate: { chapterId: string; label: string; questions: Picked[] }[] = [];
    const short: string[] = [];
    const skipped: string[] = [];

    for (const [tag, chapterId] of Object.entries(CHAPTER_MAP)) {
      if (args.only && !args.only.includes(chapterId)) continue;
      const chapter = chapterById.get(chapterId);
      if (!chapter || chapter.isArchived) {
        skipped.push(`${tag}: chapter ${chapterId} not found or archived`);
        continue;
      }
      const label = `${chapter.paper.subject.name} ${chapter.paper.name} · ${chapter.name}`;
      const usable = usableByTag.get(tag) ?? [];

      if (chapter.quizzes.some((quiz) => quiz._count.questions > 0)) {
        skipped.push(`${label}: already has an active quiz with questions (kept as is)`);
        continue;
      }
      if (usable.length < args.min) {
        short.push(`${label} [${tag}]: only ${usable.length} usable`);
        continue;
      }
      toCreate.push({ chapterId, label, questions: pick(usable).map(toQuizQuestion) });
    }

    console.log(`Question bank: ${bank.length} questions`);
    console.log(`Rejected (mapped chapters only):`, Object.fromEntries(rejected));
    console.log(`\nWill create ${toCreate.length} quizzes:`);
    for (const c of toCreate) {
      const topics = new Set(c.questions.map((q) => q.topic)).size;
      const latex = c.questions.filter((q) => q.questionText.includes("$")).length;
      console.log(
        `  ${c.label}  (${c.questions.length} questions, ${topics} topics, ${latex} with maths)`
      );
    }
    console.log(`\nFewer than ${args.min} usable questions (not created):`);
    short.forEach((line) => console.log(`  ${line}`));
    console.log(`\nSkipped:`);
    skipped.forEach((line) => console.log(`  ${line}`));

    if (args.preview) {
      const lines: string[] = [];
      for (const c of toCreate) {
        lines.push(`\n# ${c.label}`);
        c.questions.forEach((q, i) => {
          lines.push(`${i + 1}. [${q.sourceId}] ${q.questionText}`);
          q.options.forEach((o, j) =>
            lines.push(`   ${j === q.correctIndex ? "*" : " "}${"ABCDE"[j]}) ${o}`)
          );
        });
      }
      fs.writeFileSync(args.preview, lines.join("\n"), "utf8");
      console.log(`\nPreview written to ${args.preview}`);
    }

    if (!args.apply) {
      console.log("\nDry run: nothing written. Re-run with --apply to create the quizzes.");
      return;
    }

    for (const c of toCreate) {
      await prisma.$transaction(async (tx) => {
        // re-check inside the transaction so a re-run can never double up
        const existing = await tx.quiz.findFirst({
          where: { chapterId: c.chapterId, isActive: true, questions: { some: {} } },
          select: { id: true },
        });
        if (existing) {
          console.log(`  skip (quiz appeared meanwhile): ${c.label}`);
          return;
        }
        const quiz = await tx.quiz.create({
          data: {
            chapterId: c.chapterId,
            title: QUIZ_TITLE,
            timeLimitMinutes: TIME_LIMIT_MINUTES,
            isActive: true,
          },
          select: { id: true },
        });
        await tx.quizQuestion.createMany({
          data: c.questions.map((q, order) => ({
            quizId: quiz.id,
            questionText: q.questionText,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            order,
          })),
        });
        console.log(`  created: ${c.label}`);
      });
    }
    console.log("\nDone.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
