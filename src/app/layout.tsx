import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

// contexts
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalProviders } from "@/contexts/GlobalProviders";

// components
import ScrollToTop from "../components/ScrollToTop";
import ThemeToggle from "../components/ThemeToggle";

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
          <GlobalProviders>{children}</GlobalProviders>
          <Toaster />
          <ScrollToTop />
          <ThemeToggle />
        </Suspense>
      </body>
    </html>
  );
}
