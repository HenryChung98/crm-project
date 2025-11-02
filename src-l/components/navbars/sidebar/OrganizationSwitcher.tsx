import { useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { OrganizationMembers } from "../../../types/database/organizations";
import { useOrganizationCheck } from "../../../hooks/tanstack/usePlan";

interface OrganizationSwitcherProps {
  organizations: OrganizationMembers[];
  currentOrg: string;
  onOrgChange: (orgId: string) => void;
}

export default function OrganizationSwitcher({
  organizations,
  currentOrg,
  onOrgChange,
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const currentOrgData = organizations.find((org) => org.organization_id === currentOrg);
  const currentOrgName = currentOrgData?.organizations?.name || "";

  const { hasData } = useOrganizationCheck();

  return (
    <div className="relative mb-6">
      {/* main button */}
      {currentOrgName && (
        <button
          onClick={toggleDropdown}
          className="w-full p-3 bg-navbar-comp rounded-lg flex items-center justify-between hover:opacity-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white text-sm font-medium mr-3">
              {currentOrgName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium truncate">{currentOrgName}</p>
            </div>
          </div>

          <FiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* organization list */}
          {organizations.map((org) => (
            <button
              key={org.organization_id}
              onClick={() => {
                onOrgChange(org.organization_id);
                closeDropdown();
              }}
              className="w-full p-3 flex items-center justify-between hover:opacity-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white text-sm font-medium mr-3">
                  {org.organizations?.name?.charAt(0).toUpperCase() || "O"}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {org.organizations?.name || "Unknown Organization"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{org.role}</p>
                </div>
              </div>
              {org.organization_id === currentOrg && (
                <FiCheck className="text-blue-500" size={16} />
              )}
            </button>
          ))}

          {/* buttons below the list */}
          {hasData || (
            <div className="border-t border-gray-100 p-2">
              <Link
                href="/organizations/create"
                className="block w-full p-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                onClick={closeDropdown}
                prefetch={false}
              >
                + Create Your Organization
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
