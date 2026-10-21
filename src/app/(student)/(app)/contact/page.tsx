import Image from "next/image";
import { ArrowUpRight, Mail } from "lucide-react";
import { COMPANY, SITE_NAME } from "@/lib/site-config";
import { headerTileClass } from "@/components/shared/classes";
import { FacebookIcon, LinkedinIcon, WhatsappIcon } from "@/components/shared/icons/social-icons";

const CHANNELS = [
  {
    label: "Facebook",
    value: `${COMPANY.name} on Facebook`,
    href: COMPANY.facebookUrl,
    icon: FacebookIcon,
    external: true,
  },
  {
    label: "LinkedIn",
    value: `${COMPANY.name} on LinkedIn`,
    href: COMPANY.linkedinUrl,
    icon: LinkedinIcon,
    external: true,
  },
  {
    label: "WhatsApp",
    // +8801879333905 → +880 1879-333905
    value: COMPANY.whatsapp.replace(/^\+880(\d{4})(\d{6})$/, "+880 $1-$2"),
    href: `https://wa.me/${COMPANY.whatsapp.replace(/\D/g, "")}`,
    icon: WhatsappIcon,
    external: true,
  },
  {
    label: "Email",
    value: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
    icon: Mail,
    external: false,
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <section className="card-surface p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className={headerTileClass}>
            💬
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-foreground text-2xl leading-tight sm:text-3xl">
              Contact us
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm">
              Questions, feedback or ideas? Reach the {COMPANY.name} team on any of these.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-x-4 gap-y-5 pb-2 sm:grid-cols-2">
        {CHANNELS.map((channel, index) => (
          <a
            key={channel.label}
            href={channel.href}
            {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="subject-card subject-card--row block rounded-[1.25rem]"
            style={{ "--float-delay": `${-(index % 4) * 1.1}s` } as React.CSSProperties}
          >
            <div className="subject-card-float">
              <div className="subject-card-face subject-card-face--panel">
                <div className="subject-card-inner flex items-center gap-3 p-4">
                  <span className="card-well text-gold flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <channel.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-semibold sm:text-base">
                      {channel.label}
                    </p>
                    <p className="text-text-secondary truncate text-xs sm:text-sm">
                      {channel.value}
                    </p>
                  </div>
                  <ArrowUpRight className="text-foreground/40 h-5 w-5 shrink-0" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <footer className="flex flex-col-reverse gap-4 border-t border-white/6 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-text-secondary text-xs">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
        <div className="text-text-secondary flex items-center gap-2.5 text-xs">
          <span>A product by</span>
          <Image
            src={COMPANY.logo.src}
            alt={COMPANY.name}
            width={COMPANY.logo.width}
            height={COMPANY.logo.height}
            className="h-6 w-auto"
          />
        </div>
      </footer>
    </div>
  );
}
