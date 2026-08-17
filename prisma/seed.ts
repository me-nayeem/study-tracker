import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const RAW_POINTS = [
  0, 75, 227, 435, 689, 985, 1319, 1687, 2089, 2523, 2986, 3478, 3997, 4543, 5115, 5712, 6334, 6979,
  7647, 8338, 9051, 9786, 10542, 11319, 12117, 12935, 13773, 14630, 15507, 16402, 17316, 18249,
  19200, 20169, 21156, 22160, 23182, 24221, 25276, 26349, 27438, 28544, 29666, 30804, 31958, 33128,
  34314, 35515, 36732, 37964,
];

const LEVELS = RAW_POINTS.map((minPoints, i) => {
  const level = i + 1;
  const tier = TIERS[Math.floor(i / 10)];
  const sub = ROMAN[i % 10];
  return { level, minPoints, title: `${tier} Scholar ${sub}` };
});

async function main() {
  for (const l of LEVELS) {
    await prisma.levelThreshold.upsert({
      where: { level: l.level },
      create: l,
      update: { minPoints: l.minPoints, title: l.title },
    });
  }
  console.log(`Seeded ${LEVELS.length} level thresholds with titles.`);
}

main().finally(() => prisma.$disconnect());
