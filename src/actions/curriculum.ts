"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { logAudit } from "@/lib/audit";
import {
  handlePrismaError,
  fieldErrorState,
  TopicDeleteBlockedError,
  type ActionState,
} from "@/lib/prisma-errors";
import { formValue } from "@/lib/form-data";
import {
  TrackSchema,
  TrackUpdateSchema,
  SubjectSchema,
  SubjectUpdateSchema,
  PaperSchema,
  PaperUpdateSchema,
  ChapterSchema,
  ChapterUpdateSchema,
  TopicSchema,
  TopicUpdateSchema,
  ArchiveSchema,
  TopicDeleteSchema,
} from "@/schemas/curriculum";

const CURRICULUM_PATH = "/admin/curriculum";

// TRACK

export async function createTrack(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = TrackSchema.safeParse({
    name: formValue(formData, "name"),
    level: formValue(formData, "level"),
    group: formValue(formData, "group"),
    batchYear: formValue(formData, "batchYear"),
    examDate: formValue(formData, "examDate"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { name, level, group, batchYear, examDate } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const track = await tx.track.create({
        data: { name, level, group, batchYear, examDate: examDate ?? null },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "Track",
        entityId: track.id,
        metadata: { name, level, group, batchYear },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "track");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function updateTrack(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = TrackUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    name: formValue(formData, "name"),
    level: formValue(formData, "level"),
    group: formValue(formData, "group"),
    batchYear: formValue(formData, "batchYear"),
    examDate: formValue(formData, "examDate"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, name, level, group, batchYear, examDate } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.track.findUniqueOrThrow({ where: { id } });
      const track = await tx.track.update({
        where: { id },
        data: { name, level, group, batchYear, examDate: examDate ?? null },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "Track",
        entityId: track.id,
        metadata: { before, after: track },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "track");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function setTrackArchived(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);
  const parsed = ArchiveSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const isArchived = formValue(formData, "isArchived") === "true";

  try {
    await prisma.$transaction(async (tx) => {
      const track = await tx.track.update({ where: { id: parsed.data.id }, data: { isArchived } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "ARCHIVE",
        entityType: "Track",
        entityId: track.id,
        metadata: { isArchived },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "track");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

// SUBJECT

export async function createSubject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = SubjectSchema.safeParse({
    trackId: formValue(formData, "trackId"),
    name: formValue(formData, "name"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { trackId, name, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const subject = await tx.subject.create({ data: { trackId, name, order } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "Subject",
        entityId: subject.id,
        metadata: { trackId, name, order },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "subject");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function updateSubject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = SubjectUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    trackId: formValue(formData, "trackId"),
    name: formValue(formData, "name"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, name, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.subject.findUniqueOrThrow({ where: { id } });
      const subject = await tx.subject.update({ where: { id }, data: { name, order } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "Subject",
        entityId: subject.id,
        metadata: { before, after: subject },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "subject");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function setSubjectArchived(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);
  const parsed = ArchiveSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const isArchived = formValue(formData, "isArchived") === "true";

  try {
    await prisma.$transaction(async (tx) => {
      const subject = await tx.subject.update({
        where: { id: parsed.data.id },
        data: { isArchived },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "ARCHIVE",
        entityType: "Subject",
        entityId: subject.id,
        metadata: { isArchived },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "subject");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

// PAPER

export async function createPaper(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = PaperSchema.safeParse({
    subjectId: formValue(formData, "subjectId"),
    name: formValue(formData, "name"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { subjectId, name, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const paper = await tx.paper.create({ data: { subjectId, name, order } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "Paper",
        entityId: paper.id,
        metadata: { subjectId, name, order },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "paper");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function updatePaper(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = PaperUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    subjectId: formValue(formData, "subjectId"),
    name: formValue(formData, "name"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, name, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.paper.findUniqueOrThrow({ where: { id } });
      const paper = await tx.paper.update({ where: { id }, data: { name, order } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "Paper",
        entityId: paper.id,
        metadata: { before, after: paper },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "paper");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function setPaperArchived(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);
  const parsed = ArchiveSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const isArchived = formValue(formData, "isArchived") === "true";

  try {
    await prisma.$transaction(async (tx) => {
      const paper = await tx.paper.update({ where: { id: parsed.data.id }, data: { isArchived } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "ARCHIVE",
        entityType: "Paper",
        entityId: paper.id,
        metadata: { isArchived },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "paper");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

// CHAPTER

export async function createChapter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = ChapterSchema.safeParse({
    paperId: formValue(formData, "paperId"),
    name: formValue(formData, "name"),
    order: formValue(formData, "order"),
    examWeight: formValue(formData, "examWeight"),
    masteryPassPercent: formValue(formData, "masteryPassPercent"),
    isFreePreview: formValue(formData, "isFreePreview"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { paperId, name, order, examWeight, masteryPassPercent, isFreePreview } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const chapter = await tx.chapter.create({
         data: { paperId, name, order, examWeight, masteryPassPercent, isFreePreview },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "Chapter",
        entityId: chapter.id,
        metadata: { paperId, name, examWeight, masteryPassPercent, isFreePreview },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "chapter");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function updateChapter(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = ChapterUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    paperId: formValue(formData, "paperId"),
    name: formValue(formData, "name"),
    order: formValue(formData, "order"),
    examWeight: formValue(formData, "examWeight"),
    masteryPassPercent: formValue(formData, "masteryPassPercent"),
    isFreePreview: formValue(formData, "isFreePreview"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, name, order, examWeight, masteryPassPercent, isFreePreview } = parsed.data;


  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.chapter.findUniqueOrThrow({ where: { id } });
      const chapter = await tx.chapter.update({
        where: { id },
        data: { name, order, examWeight, masteryPassPercent, isFreePreview },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "Chapter",
        entityId: chapter.id,
        metadata: { before, after: chapter },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "chapter");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function setChapterArchived(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);
  const parsed = ArchiveSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const isArchived = formValue(formData, "isArchived") === "true";

  try {
    await prisma.$transaction(async (tx) => {
      const chapter = await tx.chapter.update({
        where: { id: parsed.data.id },
        data: { isArchived },
      });
      await logAudit(tx, {
        actorId: actor.id,
        action: "ARCHIVE",
        entityType: "Chapter",
        entityId: chapter.id,
        metadata: { isArchived },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "chapter");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

// TOPIC

export async function createTopic(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = TopicSchema.safeParse({
    chapterId: formValue(formData, "chapterId"),
    name: formValue(formData, "name"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { chapterId, name, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const topic = await tx.topic.create({ data: { chapterId, name, order } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "CREATE",
        entityType: "Topic",
        entityId: topic.id,
        metadata: { chapterId, name, order },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "topic");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function updateTopic(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);

  const parsed = TopicUpdateSchema.safeParse({
    id: formValue(formData, "id"),
    chapterId: formValue(formData, "chapterId"),
    name: formValue(formData, "name"),
    order: formValue(formData, "order"),
  });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id, name, order } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.topic.findUniqueOrThrow({ where: { id } });
      const topic = await tx.topic.update({ where: { id }, data: { name, order } });
      await logAudit(tx, {
        actorId: actor.id,
        action: "UPDATE",
        entityType: "Topic",
        entityId: topic.id,
        metadata: { before, after: topic },
      });
    });
  } catch (err) {
    return handlePrismaError(err, "topic");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}

export async function deleteTopic(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);
  const parsed = TopicDeleteSchema.safeParse({ id: formValue(formData, "id") });
  if (!parsed.success) return fieldErrorState(parsed.error);
  const { id } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const [resourceCount, examCount] = await Promise.all([
        tx.resource.count({ where: { topicId: id } }),
        tx.externalExam.count({ where: { topicId: id } }),
      ]);

      if (resourceCount > 0 || examCount > 0) {
        throw new TopicDeleteBlockedError(resourceCount, examCount);
      }

      const topic = await tx.topic.delete({ where: { id } });

      await logAudit(tx, {
        actorId: actor.id,
        action: "DELETE",
        entityType: "Topic",
        entityId: topic.id,
        metadata: { name: topic.name, chapterId: topic.chapterId },
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
        error: "This topic has student progress recorded and can't be deleted.",
      };
    }
    return handlePrismaError(err, "topic");
  }

  revalidatePath(CURRICULUM_PATH);
  return { success: true };
}
