export default function RoutinePage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3 text-center">
      <h1 className="font-display text-foreground text-2xl">Study routine</h1>
      <p className="text-text-secondary max-w-sm text-sm">
        The weekly routine builder is coming soon. You will be able to schedule study blocks and get
        auto-generated to-dos for each day.
      </p>
    </div>
  );
}

//coming soon:

// import { requireUser } from "@/lib/dal";
// import { getStudentProfile } from "@/lib/student-data";
// import { getStudyRoutines, getTrackSubjects } from "@/lib/study-routine-data";
// import { RoutineCreateForm } from "@/components/student/routine-create-form";
// import { RoutineCard } from "@/components/student/routine-card";

// export default async function RoutinePage() {
//   const user = await requireUser();
//   const profile = await getStudentProfile(user.id);
//   if (!profile) return null;

//   const [routines, subjects] = await Promise.all([
//     getStudyRoutines(profile.id),
//     getTrackSubjects(profile.trackId),
//   ]);

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="font-display text-foreground text-2xl">Study routine</h1>
//         <p className="text-text-secondary mt-1 text-sm">
//           Build a weekly schedule. Active routines automatically generate tomorrow's to-dos each
//           night.
//         </p>
//       </div>

//       <RoutineCreateForm />

//       <div className="space-y-4">
//         {routines.length === 0 ? (
//           <p className="text-text-secondary text-sm">No routines yet — create one above.</p>
//         ) : (
//           routines.map((routine) => (
//             <RoutineCard key={routine.id} routine={routine} subjects={subjects} />
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
