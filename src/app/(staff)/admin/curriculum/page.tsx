import { requireRole } from "@/lib/dal";
import { getCurriculumTree } from "@/lib/curriculum-data";
import { CurriculumTree } from "@/components/staff/curriculum/curriculum-tree";

export default async function CurriculumPage() {
  await requireRole(["ADMIN"]);
  const tracks = await getCurriculumTree();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Curriculum</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Track → Subject → Paper → Chapter → Topic
        </p>
      </div>
      <CurriculumTree tracks={tracks} />
    </div>
  );
}
