import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getDhakaTomorrowParts, dhakaWallClockToUtc } from "@/lib/period-key";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = getDhakaTomorrowParts(new Date());

  const items = await prisma.studyRoutineItem.findMany({
    where: { dayOfWeek: tomorrow.weekday, routine: { isActive: true } },
    select: {
      id: true,
      startMinute: true,
      label: true,
      routine: { select: { studentId: true } },
      subject: { select: { name: true } },
    },
  });

  let created = 0;
  for (const item of items) {
    const dueDate = dhakaWallClockToUtc(
      tomorrow.year,
      tomorrow.month,
      tomorrow.day,
      item.startMinute
    );
    const title = item.label?.trim() || item.subject?.name || "Study session";

    try {
      await prisma.todoItem.create({
        data: {
          studentId: item.routine.studentId,
          title,
          dueDate,
          sourceType: "ROUTINE_GENERATED",
          sourceRoutineItemId: item.id,
        },
      });
      created++;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        continue;
      }
      throw err;
    }
  }

  return NextResponse.json({ ok: true, candidateCount: items.length, created });
}
