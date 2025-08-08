import React from "react";
import Footer from "../components/Footer";
import NavBar from "../components/navbars/NavBar";
export default function BeforeSigninLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
