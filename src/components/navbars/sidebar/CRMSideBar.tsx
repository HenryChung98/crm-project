"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { createCrmNavItems, NavItemType } from "./navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { OrganizationMembers } from "../../../types/database/organizations";

// components
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { SignOutButton } from "@/components/SignOutButton";
import { ToggleButton } from "./ToggleButton";
import { UserProfile } from "./UserProfile";
import { NavItem } from "./NavItem";
import { BookingLinkModal } from "./BookingLinkModal";

interface CRMSidebarProps {
  organizations: OrganizationMembers[];
  currentOrg: string;
  currentOrgPlan: string | undefined;
  onOrgChange: (orgId: string) => void;
  onToggleSidebar: () => void;
}

export default function CRMSidebar({
  organizations,
  currentOrg,
  currentOrgPlan,
  onOrgChange,
  onToggleSidebar,
}: CRMSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState(new Set<string>());
  const [showCopyModal, setShowCopyModal] = useState(false);
  const { isCollapsed } = useSidebar();

  const { crmNavItems, isOwner } = useMemo(() => {
    const crmNavItems = createCrmNavItems(currentOrg);
    const isOwner =
      organizations.find((org) => org.organization_id === currentOrg)?.role === "owner";

    return { crmNavItems, isOwner };
  }, [currentOrg, organizations]);

  if (!organizations.length) return null;

  const toggleItem = (itemLabel: string) => {
    setExpandedItems((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(itemLabel)) {
        newExpanded.delete(itemLabel);
      } else {
        newExpanded.add(itemLabel);
      }
      return newExpanded;
    });
  };

  const toggleSidebar = () => {
    onToggleSidebar();
  };

  const isActiveItem = (item: NavItemType) => {
    const cleanItemHref = item.href?.split("?")[0];
    if (cleanItemHref && pathname === cleanItemHref) return true;

    return Boolean(
      item.children?.some((child) => {
        const cleanChildHref = child.href?.split("?")[0];
        return cleanChildHref && pathname === cleanChildHref;
      })
    );
  };

  return (
    <>
      <ToggleButton isCollapsed={isCollapsed} onClick={toggleSidebar} />
      <nav
        className={`
          w-64 pt-22 h-screen bg-navbar border-r border-border p-4 fixed left-0 top-0 overflow-y-auto z-40
          transition-transform duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <UserProfile />
        <OrganizationSwitcher
          organizations={organizations}
          currentOrg={currentOrg}
          onOrgChange={onOrgChange}
        />
        <div>{currentOrgPlan}</div>
        <div className="space-y-2">
          <SignOutButton />
          {isOwner && (
            <Link
              className="border border-border rounded p-2 block text-center"
              href={`/orgs/${currentOrg}/organizations/manage`}
            >
              manage organization
            </Link>
          )}

          {currentOrgPlan && currentOrgPlan !== "free" && (
            <button
              className="border border-border rounded p-2 w-full"
              onClick={() => setShowCopyModal(true)}
            >
              Get Links
            </button>
          )}
          {crmNavItems.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              isActive={isActiveItem(item)}
              isExpanded={expandedItems.has(item.label)}
              onToggle={() => toggleItem(item.label)}
            />
          ))}
        </div>
      </nav>

      <BookingLinkModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        currentOrgId={currentOrg}
      />
    </>
  );
}
