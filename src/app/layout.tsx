import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// components
import ThemeToggle from "./components/ThemeToggle";
import ScrollToTop from "./components/ScrollToTop";

// backend
import { AuthProvider } from "@/contexts/AuthContext";
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
        <Providers>
          <AuthProvider>
            <ThemeToggle />
            <ScrollToTop />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
