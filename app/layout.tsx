import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950">
        {children}
      </body>
    </html>
  );
}
