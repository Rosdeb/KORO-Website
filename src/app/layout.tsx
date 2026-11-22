import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali, Noto_Sans_Chakma, Noto_Sans_Myanmar } from "next/font/google";
import "glisse/styles.css";
import "./globals.css";
import { Providers } from "@/components/providers";

const fontUI = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const fontBn = Noto_Sans_Bengali({
  variable: "--font-bn",
  subsets: ["bengali"],
  preload: false,
  display: "swap",
});


const fontCcp = Noto_Sans_Chakma({
  variable: "--font-ccp",
  weight: "400",
  subsets: ["chakma"],
  preload: false,
  display: "swap",
});

const fontMya = Noto_Sans_Myanmar({
  variable: "--font-mya",
  subsets: ["myanmar"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Indigenous Language preserved and discovered",
    template: "%s · Korot",
  },
  description:
    "Explore Indigenous languages, discover words, and build your own collection of language knowledge with Korot.",
  icons: {
    icon: "/korot-logo.png",
    apple: "/korot-logo.png",
  },
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
      <head>
        {/* Theme detection runs before hydration — lives in a server component so React never sees it as a React node */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('koro-theme')||'light';var d=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.classList.add(d);document.documentElement.style.colorScheme=d;}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
