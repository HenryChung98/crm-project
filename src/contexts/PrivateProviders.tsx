"use client";
import { OrganizationProvider } from "./OrganizationContext";
import { SidebarProvider } from "./SidebarContext";

export function PrivateProviders({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </OrganizationProvider>
  );
}
