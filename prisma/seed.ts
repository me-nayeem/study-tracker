import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PointReason, ScoringMode } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const POINT_RULES: {
  reason: PointReason;
  scoringMode: ScoringMode;
  value: number;
  secondaryValue: number | null;
}[] = [
  {
    reason: PointReason.CHAPTER_MASTERED,
    scoringMode: ScoringMode.PER_WEIGHT,
    value: 10,
    secondaryValue: null,
  },
  {
    reason: PointReason.QUIZ_ATTEMPT,
    scoringMode: ScoringMode.PER_MARK,
    value: 1,
    secondaryValue: null,
  },
  {
    reason: PointReason.EXTERNAL_EXAM_RESULT,
    scoringMode: ScoringMode.PER_MARK,
    value: 1,
    secondaryValue: null,
  },
  {
    reason: PointReason.NOTE_UPLOADED,
    scoringMode: ScoringMode.FLAT,
    value: 10,
    secondaryValue: 3,
  },
  {
    reason: PointReason.STREAK_BONUS,
    scoringMode: ScoringMode.FLAT,
    value: 1,
    secondaryValue: null,
  },
  {
    reason: PointReason.PLAYLIST_REVIEWED,
    scoringMode: ScoringMode.FLAT,
    value: 5,
    secondaryValue: null,
  },
];

async function main() {
  for (const rule of POINT_RULES) {
    await prisma.pointRule.upsert({
      where: { reason: rule.reason },
      update: {},
      create: rule,
    });
  }
  console.log(`Seeded ${POINT_RULES.length} PointRule rows.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
