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

type OrgMember = {
  id: string;
  organization_id: string;
  role: string;
  created_at: string;
  organizations: {
    name: string;
  } | null;
};

interface NavItemProps {
  item: CRMNavItemType;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

interface CRMSidebarProps {
  organizations: OrgMember[];
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
          isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
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
              className="block p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
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
  <div className="absolute bottom-4 left-4 right-4 p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {user?.first_name?.charAt(0) || "U"}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>
    </div>
  </div>
);

export default function CRMSidebar({ organizations, currentOrg, onOrgChange }: CRMSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedItems, setExpandedItems] = useState(new Set<string>());
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

  const isActiveItem = (item: CRMNavItemType) => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    return false;
  };

  return (
    <nav className="w-64 h-screen bg-white border-r border-gray-200 p-4 fixed left-0 top-0 overflow-y-auto">
      <OrganizationSwitcher
        organizations={organizations}
        currentOrg={currentOrg}
        onOrgChange={onOrgChange}
      />

      <div className="space-y-2">
        <button className="text-black" onClick={signOut}>
          sign out
        </button>

        {(() => {
          const currentOrgMembership = organizations.find(
            (org) => org.organization_id === currentOrg
          );
          if (currentOrgMembership?.role === "owner") {
            return (
              <div>
                <Link className="text-black" href={`/dashboard/organizations/manage${queryParam}`}>
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

      <UserProfile user={user} />
    </nav>
  );
}
