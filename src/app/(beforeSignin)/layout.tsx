import React from "react";
import ScrollToTop from "../components/ScrollToTop";
import Footer from "../components/Footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
