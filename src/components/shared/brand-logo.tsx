import Image from "next/image";
import { SITE_NAME } from "@/lib/site-config";

const SIZES = {
  sm: { mark: 24, text: "text-base" },
  md: { mark: 28, text: "text-lg" },
} as const;

export function BrandLogo({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { mark, text } = SIZES[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={mark}
        height={Math.round((mark * 239) / 256)}
        className="shrink-0"
        preload
      />
      <span className={`font-display text-foreground leading-none ${text}`}>{SITE_NAME}</span>
    </span>
  );
}
