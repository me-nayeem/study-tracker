import { requireUser } from "@/lib/dal";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}
