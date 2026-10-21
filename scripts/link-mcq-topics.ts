/**
 * Turns the question bank's topic tags into chapter topics (Bangla names) and links each
 * imported quiz question to its topic. Companion to import-chapter-mcqs.ts.
 *
 * Usage:
 *   npx tsx scripts/link-mcq-topics.ts --list <out.json>       # read-only: tags used per chapter
 *   npx tsx scripts/link-mcq-topics.ts --names <names.json>    # dry run with Bangla names
 *   npx tsx scripts/link-mcq-topics.ts --names <names.json> --apply
 *
 * names.json maps tag → Bangla topic name,
 * e.g. { "phy.thermodynamics.thermodynamic-laws": "তাপগতিবিদ্যার সূত্রসমূহ" }.
 *
 * Questions are matched to the bank by chapter tag + question text. Topics are appended after a chapter's
 * existing ones in the order their questions appear; a topic with the same name is reused,
 * and questions that already have a topic are left alone, so re-running is safe. Each
 * chapter is written in its own transaction.
 *
 * Needs DIRECT_URL (or DATABASE_URL) in .env.
 */
import "dotenv/config";
import fs from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CHAPTER_MAP } from "./mcq-chapter-map";
import { loadBank } from "./mcq-bank";

type ChapterPlan = {
  chapterId: string;
  chapterName: string;
  links: { questionId: string; tag: string }[];
  unmatched: number;
};

const normalize = (text: string) => text.replace(/[\s।?.,:;!'"“”‘’()-]+/g, "").toLowerCase();

function parseArgs(argv: string[]) {
  const args = { list: "", names: "", apply: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--list") args.list = argv[++i];
    else if (argv[i] === "--names") args.names = argv[++i];
    else if (argv[i] === "--apply") args.apply = true;
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  if (!args.list && !args.names) throw new Error("Pass --list <file> or --names <file>");
  return args;
}

/** "chapterTag|normalized question text" → topic tag, for every tagged question in the bank */
function loadTopicByText(): Map<string, string> {
  const map = new Map<string, string>();
  for (const q of loadBank()) {
    const key = `${q.chapter_id}|${normalize(q.question.text)}`;
    if (q.topic_id && !map.has(key)) map.set(key, q.topic_id);
  }
  return map;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
    }),
  });

  try {
    const topicByText = loadTopicByText();
    const tagByChapterId = new Map(Object.entries(CHAPTER_MAP).map(([tag, id]) => [id, tag]));
    const quizzes = await prisma.quiz.findMany({
      where: { isActive: true, questions: { some: {} } },
      select: {
        chapterId: true,
        chapter: { select: { name: true } },
        questions: {
          select: { id: true, questionText: true, topicId: true },
          orderBy: { order: "asc" },
        },
      },
    });

    const plan: ChapterPlan[] = [];
    for (const quiz of quizzes) {
      const chapterTag = tagByChapterId.get(quiz.chapterId);
      if (!chapterTag) continue; // not a question-bank chapter
      const links: ChapterPlan["links"] = [];
      let unmatched = 0;
      for (const q of quiz.questions) {
        if (q.topicId) continue;
        const tag = topicByText.get(`${chapterTag}|${normalize(q.questionText)}`);
        if (tag) links.push({ questionId: q.id, tag });
        else unmatched++;
      }
      if (links.length || unmatched) {
        plan.push({ chapterId: quiz.chapterId, chapterName: quiz.chapter.name, links, unmatched });
      }
    }

    const linkCount = plan.reduce((n, p) => n + p.links.length, 0);
    const unmatchedCount = plan.reduce((n, p) => n + p.unmatched, 0);
    const allTags = new Set(plan.flatMap((p) => p.links.map((l) => l.tag)));
    console.log(
      `${plan.length} chapters, ${linkCount} questions to link, ${allTags.size} distinct tags, ${unmatchedCount} questions with no bank match`
    );

    if (args.list) {
      const out: Record<string, { chapter: string; tags: Record<string, number> }> = {};
      for (const p of plan) {
        const tags: Record<string, number> = {};
        for (const l of p.links) tags[l.tag] = (tags[l.tag] ?? 0) + 1;
        out[p.chapterId] = { chapter: p.chapterName, tags };
      }
      fs.writeFileSync(args.list, JSON.stringify(out, null, 1), "utf8");
      console.log(`Written to ${args.list}`);
      return;
    }

    const names: Record<string, string> = JSON.parse(fs.readFileSync(args.names, "utf8"));
    const nameOf = (tag: string) => names[tag]?.trim() ?? "";
    const missing = [...allTags].filter((tag) => !nameOf(tag));
    if (missing.length) {
      console.error(
        `No Bangla name for ${missing.length} tags, e.g. ${missing.slice(0, 5).join(", ")}`
      );
      process.exit(1);
    }

    const existing = await prisma.topic.findMany({
      where: { chapterId: { in: plan.map((p) => p.chapterId) } },
      select: { chapterId: true, name: true },
    });
    for (const p of plan) {
      const have = new Set(existing.filter((t) => t.chapterId === p.chapterId).map((t) => t.name));
      const topicNames = [...new Set(p.links.map((l) => nameOf(l.tag)))];
      const fresh = topicNames.filter((n) => !have.has(n)).length;
      console.log(
        `  ${p.chapterName}: ${p.links.length} questions → ${topicNames.length} topics (${fresh} new)${p.unmatched ? `, ${p.unmatched} unmatched` : ""}`
      );
    }

    if (!args.apply) {
      console.log("\nDry run: nothing written. Re-run with --apply.");
      return;
    }

    for (const p of plan) {
      if (!p.links.length) continue;
      await prisma.$transaction(
        async (tx) => {
          const current = await tx.topic.findMany({
            where: { chapterId: p.chapterId },
            select: { id: true, name: true, order: true },
          });
          const idByName = new Map(current.map((t) => [t.name, t.id]));
          let order = current.reduce((max, t) => Math.max(max, t.order), -1);

          for (const link of p.links) {
            const name = nameOf(link.tag);
            let topicId = idByName.get(name);
            if (!topicId) {
              topicId = (
                await tx.topic.create({
                  data: { chapterId: p.chapterId, name, order: ++order },
                  select: { id: true },
                })
              ).id;
              idByName.set(name, topicId);
            }
            await tx.quizQuestion.updateMany({
              where: { id: link.questionId, topicId: null },
              data: { topicId },
            });
          }
          // ~40 sequential round trips per chapter; the 5 s default is too tight over the network
        },
        { timeout: 60_000, maxWait: 10_000 }
      );
      console.log(`  linked: ${p.chapterName}`);
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
