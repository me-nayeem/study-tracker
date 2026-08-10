import { Prisma } from "@/generated/prisma/client";
import type { ZodError } from "zod";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export class TopicDeleteBlockedError extends Error {
  constructor(resourceCount: number, examCount: number) {
    const parts: string[] = [];
    if (resourceCount > 0) parts.push(`${resourceCount} resource(s)`);
    if (examCount > 0) parts.push(`${examCount} external exam(s)`);
    super(
      `Can't delete this topic — it still has ${parts.join(" and ")} attached. Remove those first.`
    );
    this.name = "TopicDeleteBlockedError";
  }
}

export class LastAdminError extends Error {
  constructor() {
    super("Can't change this — they're the last remaining admin. Promote another admin first.");
    this.name = "LastAdminError";
  }
}

export function fieldErrorState(error: ZodError): ActionState {
  return {
    success: false,
    error: "Please fix the errors below.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

export function handlePrismaError(err: unknown, entityLabel: string): ActionState {
  if (err instanceof TopicDeleteBlockedError || err instanceof LastAdminError) {
    return { success: false, error: err.message };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ");
      return {
        success: false,
        error: `A ${entityLabel} with this ${target ?? "value"} already exists.`,
      };
    }
    if (err.code === "P2003") {
      return {
        success: false,
        error: `This ${entityLabel} references, or is referenced by, a record that blocks this action.`,
      };
    }
    if (err.code === "P2025") {
      return {
        success: false,
        error: `This ${entityLabel} was already changed or deleted elsewhere. Refresh and try again.`,
      };
    }
  }

  console.error(`[curriculum] unexpected error on ${entityLabel}:`, err);
  return { success: false, error: "Something went wrong. Please try again." };
}
