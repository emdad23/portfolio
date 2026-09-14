import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { CustomCursor } from "@/components/layout/CustomCursor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Emdad Ullah — Principal Software Engineer",
  // Generic on purpose: the home page's generateMetadata adds the computed years.
  description: "Principal Software Developer in eCommerce, CRM, and enterprise systems. Leading teams, managing clients, and shipping products that matter.",
  keywords: ["Principal Engineer", "Software Developer", "Bangladesh", "Magento", "Team Leadership", "eCommerce"],
  openGraph: {
    title: "Emdad Ullah — Principal Software Engineer",
    description: "Principal Software Developer in eCommerce, CRM, and enterprise systems.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ProgressBar />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
