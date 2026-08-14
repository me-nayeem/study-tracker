"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { logAudit } from "@/lib/audit";
import { handlePrismaError, fieldErrorState, type ActionState } from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import {
  QuizSchema,
  QuizUpdateSchema,
  QuizQuestionSchema,
  QuizQuestionUpdateSchema,
  SetQuizActiveSchema,
  DeleteQuizSchema,
  DeleteQuizQuestionSchema,
} from "@/schemas/quiz";

function quizPath(chapterId: string) {
  return `/manager/quizzes/${chapterId}`;
}

function parseOptions(formData: FormData): string[] {
  return formData.getAll("options").map((v) => String(v));
}

export async function createQuiz(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = QuizSchema.safeParse({
    chapterId: formValue(formData, "chapterId"),
    title: formValue(formData, "title"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { chapterId, title } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({ data: { chapterId, title, isActive: false } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "Quiz",
        entityId: quiz.id,
        metadata: { chapterId, title },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "quiz");
  }

  revalidatePath(quizPath(chapterId));
  return { success: true };
}

export async function updateQuiz(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = QuizUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    chapterId: formValue(formData, "chapterId"),
    title: formValue(formData, "title"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, chapterId, title } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.quiz.findUniqueOrThrow({ where: { id } });
      const quiz = await tx.quiz.update({ where: { id }, data: { title } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "Quiz",
        entityId: quiz.id,
        metadata: { before, after: quiz },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "quiz");
  }

  revalidatePath(quizPath(chapterId));
  return { success: true };
}

export async function setQuizActive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = SetQuizActiveSchema.safeParse({
    id: formValue(formData, "id"),
    chapterId: formValue(formData, "chapterId"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, chapterId } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.quiz.updateMany({
        where: { chapterId, id: { not: id } },
        data: { isActive: false },
      });
      const quiz = await tx.quiz.update({ where: { id }, data: { isActive: true } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "Quiz",
        entityId: quiz.id,
        metadata: { isActive: true, deactivatedSiblings: true },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "quiz");
  }

  revalidatePath(quizPath(chapterId));
  return { success: true };
}

export async function deleteQuiz(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = DeleteQuizSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id } = parsed.data;
  const chapterId = formValue(formData, "chapterId") ?? "";

  try {
    await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.delete({ where: { id } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "DELETE",
        entityType: "Quiz",
        entityId: quiz.id,
        metadata: { title: quiz.title, chapterId: quiz.chapterId },
      });
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2003"
    ) {
      return {
        success: false,
        error:
          "This quiz has student attempts recorded and can't be deleted. Deactivate it instead.",
      };
    }
    return handlePrismaError(err, "quiz");
  }

  revalidatePath(quizPath(chapterId));
  return { success: true };
}

export async function createQuizQuestion(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = QuizQuestionSchema.safeParse({
    quizId: formValue(formData, "quizId"),
    questionText: formValue(formData, "questionText"),
    options: parseOptions(formData),
    correctIndex: formValue(formData, "correctIndex"),
    explanation: formValue(formData, "explanation"),
    topicId: formValue(formData, "topicId"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { quizId, questionText, options, correctIndex, explanation, topicId, order } = parsed.data;
  const chapterId = formValue(formData, "chapterId") ?? "";

  try {
    await prisma.$transaction(async (tx) => {
      const question = await tx.quizQuestion.create({
        data: {
          quizId,
          questionText,
          options,
          correctIndex,
          explanation: explanation ?? null,
          topicId: topicId || null,
          order,
        },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "QuizQuestion",
        entityId: question.id,
        metadata: { quizId, questionText },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "question");
  }

  revalidatePath(quizPath(chapterId));
  return { success: true };
}

export async function updateQuizQuestion(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = QuizQuestionUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    quizId: formValue(formData, "quizId"),
    questionText: formValue(formData, "questionText"),
    options: parseOptions(formData),
    correctIndex: formValue(formData, "correctIndex"),
    explanation: formValue(formData, "explanation"),
    topicId: formValue(formData, "topicId"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, questionText, options, correctIndex, explanation, topicId, order } = parsed.data;
  const chapterId = formValue(formData, "chapterId") ?? "";

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.quizQuestion.findUniqueOrThrow({ where: { id } });
      const question = await tx.quizQuestion.update({
        where: { id },
        data: {
          questionText,
          options,
          correctIndex,
          explanation: explanation ?? null,
          topicId: topicId || null,
          order,
        },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "QuizQuestion",
        entityId: question.id,
        metadata: { before, after: question },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "question");
  }

  revalidatePath(quizPath(chapterId));
  return { success: true };
}

export async function deleteQuizQuestion(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN", "MANAGER"]);

  const parsed = DeleteQuizQuestionSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id } = parsed.data;
  const chapterId = formValue(formData, "chapterId") ?? "";

  try {
    await prisma.$transaction(async (tx) => {
      const question = await tx.quizQuestion.delete({ where: { id } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "DELETE",
        entityType: "QuizQuestion",
        entityId: question.id,
        metadata: { quizId: question.quizId },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "question");
  }

  revalidatePath(quizPath(chapterId));
  return { success: true };
}
