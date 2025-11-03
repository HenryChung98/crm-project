import React from "react";
import { PrivateProviders } from "@/contexts/PrivateProviders";
export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PrivateProviders>{children}</PrivateProviders>
    </>
  );
}
