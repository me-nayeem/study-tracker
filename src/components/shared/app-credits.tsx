import Image from "next/image";
import { COMPANY, SITE_NAME } from "@/lib/site-config";

/** Page footer: copyright on the left, "A product by AnoFamous" on the right. */
export function AppCredits({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`flex flex-col-reverse gap-4 border-t border-white/6 pt-5 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
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
  );
}
