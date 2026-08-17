import { DEVELOPERS } from "@/lib/developers";

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-2xl">Contact</h1>
        <p className="text-text-secondary mt-1 text-sm">
          Two people, no team — here&apos;s who&apos;s behind HSC Study Tracker.
        </p>
      </div>

      <div className="space-y-4">
        {DEVELOPERS.map((dev) => (
          <div key={dev.name} className="border-bg-elevated bg-bg-surface rounded-xl border p-5">
            <h2 className="font-display text-foreground text-lg">{dev.name}</h2>
            <p className="text-text-secondary mt-1 text-sm">{dev.role}</p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {dev.portfolioUrl && (
                <a
                  href={dev.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary underline-offset-4 hover:underline"
                >
                  Portfolio
                </a>
              )}
              {dev.linkedinUrl && (
                <a
                  href={dev.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary underline-offset-4 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {dev.githubUrl && (
                <a
                  href={dev.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary underline-offset-4 hover:underline"
                >
                  GitHub
                </a>
              )}
              {dev.email && (
                <a
                  href={`mailto:${dev.email}`}
                  className="text-accent-primary underline-offset-4 hover:underline"
                >
                  Email
                </a>
              )}
              {dev.phone && (
                <a
                  href={`https://wa.me/880${dev.phone.slice(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary underline-offset-4 hover:underline"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
