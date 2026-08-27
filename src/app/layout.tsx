import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Bengali, Noto_Sans_Chakma, Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const fontUI = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const fontBn = Noto_Sans_Bengali({
  variable: "--font-bn",
  subsets: ["bengali"],
  display: "swap",
});

const fontCcp = Noto_Sans_Chakma({
  variable: "--font-ccp",
  weight: "400",
  subsets: ["chakma"],
  display: "swap",
});

const fontMya = Noto_Sans_Myanmar({
  variable: "--font-mya",
  subsets: ["myanmar"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Koro — Discover. Learn. Preserve.",
    template: "%s · Koro",
  },
  description:
    "Explore languages, discover words, and build your own collection of language knowledge with Koro.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontUI.variable} ${fontBn.variable} ${fontCcp.variable} ${fontMya.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
