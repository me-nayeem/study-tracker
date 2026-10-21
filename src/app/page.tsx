import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";

/** No landing page: staff go to their panel, everyone else (signed in or not) to the dashboard. */
export default async function Home() {
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") redirect("/admin");
  if (user?.role === "MANAGER") redirect("/manager");
  redirect("/dashboard");
}
