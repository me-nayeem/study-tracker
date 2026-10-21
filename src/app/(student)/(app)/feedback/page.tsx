import { headerTileClass } from "@/components/shared/classes";
import { FeedbackForm } from "@/components/student/feedback-form";

export default function FeedbackPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <section className="card-surface p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className={headerTileClass}>
            📣
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-foreground text-2xl leading-tight sm:text-3xl">
              Feedback
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm">
              Found a bug or have an idea? Let us know — we read every message.
            </p>
          </div>
        </div>
      </section>

      <FeedbackForm />
    </div>
  );
}
