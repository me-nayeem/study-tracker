import { FeedbackForm } from "@/components/student/feedback-form";

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Feedback</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Found a bug or have an idea? Let us know — we read every message.
        </p>
      </div>
      <FeedbackForm />
    </div>
  );
}
