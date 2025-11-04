"use client";
import { OrganizationProvider } from "./OrganizationContext";
import { SubscriptionProvider } from "./SubscriptionContext";
import { SidebarProvider } from "./SidebarContext";

export function PrivateProviders({ children }: { children: React.ReactNode }) {
  return (
    <OrganizationProvider>
      <SubscriptionProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </SubscriptionProvider>
    </OrganizationProvider>
  );
}
