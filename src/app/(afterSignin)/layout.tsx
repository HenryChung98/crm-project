import React, { useState } from "react";
import NavBar from "../components/navbar/NavBar";
import ScrollToTop from "../components/ScrollToTop";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
