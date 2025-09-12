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

// type
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
}

// navigation item component
const NavItem = ({ item, isActive, isExpanded, onToggle }: NavItemProps) => {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
          isActive ? "bg-blue-100 text-blue-700" : "hover:opacity-50"
        }`}
        onClick={hasChildren ? onToggle : undefined}
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

// profile component
const UserProfile = ({ user }: { user: AuthUserType | null }) => (
  <div className="absolute top-4 left-4 right-4 p-3 bg-navbar-comp rounded-lg">
    <div className="flex items-center">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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

export default function CRMSidebar({ organizations, currentOrg, onOrgChange }: CRMSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedItems, setExpandedItems] = useState(new Set<string>());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { signOut } = useSupabase();

  const queryString = searchParams.toString();
  const queryParam = queryString ? `?${queryString}` : "";

  const crmNavItems = createCrmNavItems(searchParams);

  const toggleItem = (itemLabel: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemLabel)) {
      newExpanded.delete(itemLabel);
    } else {
      newExpanded.add(itemLabel);
    }
    setExpandedItems(newExpanded);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActiveItem = (item: CRMNavItemType) => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    return false;
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* 사이드바 토글 버튼 */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 bg-background z-50 p-2 border-2 rounded-lg shadow-sm hover:opacity-50 md:hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isCollapsed ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          )}
        </svg>
      </button>

      {/* 데스크톱 토글 버튼 */}
      <button
        onClick={toggleSidebar}
        className="hidden md:block fixed bg-background top-7 left-4 z-50 p-2 border-2 rounded-lg shadow-sm hover:opacity-50"
        style={{ left: isCollapsed ? "16px" : "204px" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isCollapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          )}
        </svg>
      </button>

      {/* 사이드바 */}
      <nav
        className={`
          w-64 pt-22 h-screen bg-navbar border-r border-gray-200 p-4 fixed left-0 top-0 overflow-y-auto z-40
          transition-transform duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full md:-translate-x-full" : "translate-x-0"}
        `}
      >
        <UserProfile user={user} />
        <OrganizationSwitcher
          organizations={organizations}
          currentOrg={currentOrg}
          onOrgChange={onOrgChange}
        />

        <div className="space-y-2">
          <button className="border border-border rounded p-2" onClick={signOut}>
            sign out
          </button>

          {(() => {
            const currentOrgMembership = organizations.find(
              (org) => org.organization_id === currentOrg
            );
            if (currentOrgMembership?.role === "owner") {
              return (
                <div>
                  <Link
                    className="border border-border rounded p-2"
                    href={`/dashboard/organizations/manage${queryParam}`}
                  >
                    manage organization
                  </Link>
                </div>
              );
            }
            return null;
          })()}
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
