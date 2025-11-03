"use client";
import { OrganizationProvider } from "./OrganizationContext";

export function PrivateProviders({ children }: { children: React.ReactNode }) {
  return <OrganizationProvider>{children}</OrganizationProvider>;
}
