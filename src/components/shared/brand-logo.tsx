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
  // the mark is 256×239, so the height never comes out whole; pinning both sides in CSS
  // keeps the rendered size equal to the attributes (object-contain absorbs the rounding)
  const height = Math.round((mark * 239) / 256);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/brand/logo-mark.png"
        alt=""
        width={mark}
        height={height}
        style={{ width: mark, height }}
        className="shrink-0 object-contain"
        preload
      />
      <span className={`font-display text-foreground leading-none ${text}`}>{SITE_NAME}</span>
    </span>
  );
}
