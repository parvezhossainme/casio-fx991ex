import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Casio fx-991EX ClassWiz — Web Emulator",
  description:
    "An independent, browser-only scientific calculator emulator inspired by the Casio fx-991EX ClassWiz. Educational project, not affiliated with Casio.",
  applicationName: "fx-991EX Web Emulator",
  keywords: [
    "calculator",
    "scientific calculator",
    "fx-991EX",
    "ClassWiz",
    "emulator",
    "Next.js",
  ],
  authors: [{ name: "fx-991EX Web Emulator contributors" }],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${jetbrainsMono.variable} ${orbitron.variable} ${shareTechMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
