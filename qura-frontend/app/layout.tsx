import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 🔥 Google-like Font
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Search - Qura Technologies",
  description: "Search the future with Qura",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${inter.className} min-h-full flex flex-col bg-white text-[#111827]`}
      >
        {children}
      </body>
    </html>
  );
}