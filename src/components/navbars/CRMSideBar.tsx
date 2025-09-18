"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { createCrmNavItems, CRMNavItemType } from "@/utils/data/navigation";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationSwitcher from "./OrganizationSwitcher";
import { useSupabase } from "@/hooks/useSupabase";
import { AuthUserType } from "@/types/authuser";
import { OrganizationMembers } from "@/types/database/organizations";

interface NavItemProps {
  item: CRMNavItemType;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

interface CRMSidebarProps {
  organizations: OrganizationMembers[];
  currentOrg: string;
  onOrgChange: (orgId: string) => void;
  onToggleSidebar: () => void;
}

const ToggleButton = ({
  isCollapsed,
  onClick,
  className,
}: {
  isCollapsed: boolean;
  onClick: () => void;
  className: string;
}) => (
  <button
    onClick={onClick}
    className={`bg-background z-50 p-2 border-1 rounded-lg shadow-sm hover:opacity-50 transition-all duration-300 ease-in-out ${className}`}
  >
    <svg className="w-2 h-15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
        d={isCollapsed ? "M6 3l12 9-12 9" : "M18 21L6 12l12-9"}
      />
    </svg>
  </button>
);

const NavItem = ({ item, isActive, isExpanded, onToggle }: NavItemProps) => {
  const hasChildren = item.children && item.children.length > 0;

  const handleItemClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
          isActive ? "bg-blue-100 text-blue-700" : "hover:opacity-50"
        }`}
        onClick={handleItemClick}
      >
        <Link href={item.href} className="flex items-center flex-1">
          <span className="mr-3 text-lg">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </Link>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
          </button>
        )}
      </div>

      {hasChildren && isExpanded && item.children && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              className="block p-2 text-sm text-text-secondary hover:opacity-50 rounded transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const UserProfile = ({ user }: { user: AuthUserType | null }) => (
  <div className="absolute top-4 left-4 right-4 p-3 bg-navbar-comp rounded-lg">
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
        {user?.first_name?.charAt(0) || "U"}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-xs text-text-secondary">{user?.email}</p>
      </div>
    </div>
  </div>
);

export default function CRMSidebar({
  organizations,
  currentOrg,
  onOrgChange,
  onToggleSidebar,
}: CRMSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedItems, setExpandedItems] = useState(new Set<string>());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { signOut } = useSupabase();

  const queryString = searchParams.toString();
  const queryParam = queryString ? `?${queryString}` : "";
  const crmNavItems = createCrmNavItems(searchParams);

  // Owner 권한 체크
  const isOwner = organizations.find((org) => org.organization_id === currentOrg)?.role === "owner";

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
    setIsCollapsed((prev) => !prev);
  };

  const isActiveItem = (item: CRMNavItemType) => {
    if (pathname === item.href) return true;
    return item.children?.some((child) => pathname === child.href) ?? false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black z-40 md:hidden"
          style={{ opacity: 0.8 }}
          onClick={toggleSidebar}
        />
      )}

      {/* Toggle Buttons */}
      <ToggleButton
        isCollapsed={isCollapsed}
        onClick={toggleSidebar}
        className={
          isCollapsed
            ? "fixed top-1/2 -translate-y-1/2 -left-2 transition-all duration-300 ease-in-out md:hidden"
            : "fixed top-1/2 -translate-y-1/2 left-60 transition-all duration-300 ease-in-out md:hidden"
        }
      />

      <ToggleButton
        isCollapsed={isCollapsed}
        onClick={toggleSidebar}
        className={
          isCollapsed
            ? "hidden md:block fixed top-1/2 -translate-y-1/2 -left-2 transition-all duration-300 ease-in-out"
            : "hidden md:block fixed top-1/2 -translate-y-1/2 left-60 transition-all duration-300 ease-in-out"
        }
      />

      {/* Sidebar */}
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

          {/* Owner만 조직 관리 버튼 표시 */}
          {isOwner && (
            <Link
              className="border border-border rounded p-2 block text-center"
              href={`/dashboard/organizations/manage${queryParam}`}
            >
              manage organization
            </Link>
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
    </>
  );
}
