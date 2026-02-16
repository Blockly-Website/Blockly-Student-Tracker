import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import { PreferencesProvider } from "@/lib/preferences";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Blockly",
    template: "%s — Blockly",
  },
  description: "Self-hosted school schedule and task tracker for individual students. Track classes, blocks, tasks, and overrides.",
  manifest: "/manifest.json",
  keywords: ["schedule", "student", "tracker", "school", "blocks", "tasks", "self-hosted"],
  authors: [{ name: "Blockly" }],
  openGraph: {
    title: "Blockly",
    description: "Self-hosted school schedule and task tracker for individual students.",
    siteName: "Blockly",
    type: "website",
    locale: "en_US",
  },
  other: {
    "theme-color": "#6366F1",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <AppProviders>
          <PreferencesProvider>{children}</PreferencesProvider>
        </AppProviders>
      </body>
    </html>
  );
}
