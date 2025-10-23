"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createCrmNavItems, NavItemType } from "@/utils/data/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import OrganizationSwitcher from "./OrganizationSwitcher";
import { useSupabase } from "@/hooks/useSupabase";
import { OrganizationMembers } from "@/types/database/organizations";
import { usePlanByOrg } from "@/hooks/tanstack/usePlan";
import ToggleButton from "./ToggleButton";
import UserProfile from "./UserProfile";
import NavItem from "./NavItem";
import BookingLinkModal from "./BookingLinkModal";

interface CRMSidebarProps {
  organizations: OrganizationMembers[];
  currentOrg: string;
  onOrgChange: (orgId: string) => void;
  onToggleSidebar: () => void;
}

export default function CRMSidebar({
  organizations,
  currentOrg,
  onOrgChange,
  onToggleSidebar,
}: CRMSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedItems, setExpandedItems] = useState(new Set<string>());
  const [showCopyModal, setShowCopyModal] = useState(false);
  const { user } = useAuth();
  const { signOut } = useSupabase();
  const { isCollapsed } = useSidebar();

  const { data: orgPlan } = usePlanByOrg(currentOrg);

  const { queryParam, crmNavItems, isOwner } = useMemo(() => {
    const queryString = searchParams.toString();
    const queryParam = queryString ? `?${queryString}` : "";
    const crmNavItems = createCrmNavItems(searchParams);
    const isOwner =
      organizations.find((org) => org.organization_id === currentOrg)?.role === "owner";

    return { queryParam, crmNavItems, isOwner };
  }, [searchParams, organizations, currentOrg]);

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
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black z-40 md:hidden"
          style={{ opacity: 0.5 }}
          onClick={toggleSidebar}
        />
      )}

      <ToggleButton isCollapsed={isCollapsed} onClick={toggleSidebar} />

      <nav
        className={`
          w-64 pt-22 h-screen bg-navbar border-r border-border p-4 fixed left-0 top-0 overflow-y-auto z-40
          transition-transform duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        <UserProfile user={user} />

        <OrganizationSwitcher
          organizations={organizations}
          currentOrg={currentOrg}
          onOrgChange={onOrgChange}
        />

        <div className="space-y-2">
          <button className="border border-border rounded p-2 w-full" onClick={signOut}>
            Sign Out
          </button>

          {isOwner && (
            <Link
              className="border border-border rounded p-2 block text-center"
              href={`/organizations/manage${queryParam}`}
            >
              manage organization
            </Link>
          )}

          {orgPlan && orgPlan.plans.name !== "free" && (
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
