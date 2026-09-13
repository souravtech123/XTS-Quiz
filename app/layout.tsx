import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XTS Tech Arena — Season 1 | Xavier’s Tech Byte Society",
  description: "Test your technical knowledge. Challenge yourself. Compete with the best in XTS Tech Arena Season 1.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#060913] text-slate-100 selection:bg-purple-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
