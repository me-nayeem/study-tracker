import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

const roles = Object.values(Role) as [Role, ...Role[]];
const id = z.string().min(1, "Missing id.");

export const ChangeRoleSchema = z.object({
  userId: id,
  newRole: z.enum(roles, { error: "Select a valid role." }),
});

export const UserIdSchema = z.object({ userId: id });
