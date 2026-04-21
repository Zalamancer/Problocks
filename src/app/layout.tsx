import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque, DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { QualityProvider } from "@/components/QualityProvider";
import { DataSourceToggle } from "@/components/dev/DataSourceToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://playdemy.app"),
  title: {
    default: "Playdemy — AI-powered game creation for classrooms",
    template: "%s · Playdemy",
  },
  description:
    "Playdemy lets students describe a game and watch AI turn it into a playable HTML5 game, publish to a classroom marketplace, and earn from plays.",
  applicationName: "Playdemy",
  keywords: [
    "AI game maker",
    "classroom games",
    "educational games",
    "HTML5 games",
    "game creation for students",
    "Scratch alternative",
  ],
  authors: [{ name: "Playdemy" }],
  openGraph: {
    type: "website",
    url: "https://playdemy.app",
    siteName: "Playdemy",
    title: "Playdemy — AI-powered game creation for classrooms",
    description:
      "Students describe a game, AI builds it, classmates play it. Publish to the marketplace and earn from plays.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playdemy — AI-powered game creation for classrooms",
    description:
      "Students describe a game, AI builds it, classmates play it.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${dmMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QualityProvider />
        {children}
        <DataSourceToggle />
      </body>
    </html>
  );
}
