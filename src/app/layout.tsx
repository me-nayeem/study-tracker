import "./globals.css";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Work_Sans, Fraunces } from "next/font/google";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { DialogProvider } from "@/components/shared/dialog-provider";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
};

export const viewport: Viewport = {
  themeColor: "#17140F",
  colorScheme: "dark",
};

const ibm_plex_mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

const work_sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "700"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${ibm_plex_mono.variable} ${work_sans.variable} ${fraunces.variable}`}
    >
      <body className="flex min-h-full flex-col">
        <AuthSessionProvider>
          <DialogProvider>{children}</DialogProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
