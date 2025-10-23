import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

// components
import ScrollToTop from "../components/ScrollToTop";
import ThemeToggle from "../components/ThemeToggle";

// backend
import { Providers } from "@/contexts/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRM Project",
  description: "CRM powered by Next.js + Tailwind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Suspense>
          <Providers>
              {children}
              <Toaster />
              <ScrollToTop />
              <ThemeToggle />
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
