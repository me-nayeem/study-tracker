import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "MANAGER") redirect("/manager");
    redirect("/dashboard");
  }

  return (
    <div className="bg-background flex flex-1 flex-col items-center justify-center">
      <span className="font-display text-foreground text-lg">HSC Study Tracker</span>
    </div>
  );
}
