import { SiMinetest } from "react-icons/si";
import React from "react";

export interface NavItemType {
  label: string;
  href: string;
  children?: NavItemType[];
}

export interface CRMNavItemType extends NavItemType {
  icon?: React.ReactNode;
}

// before sign in navbar
export const navItems: NavItemType[] = [
  {
    label: "menu1",
    href: "#",
    children: [{ label: "submenu1", href: "#" }],
  },
];

// after sign in navbar
export function createCrmNavItems(searchParams: URLSearchParams): CRMNavItemType[] {
  const queryString = searchParams.toString();
  const queryParam = queryString ? `?${queryString}` : "";

  return [
    {
      label: "Dashboard",
      href: `/dashboard${queryParam}`,
      icon: React.createElement(SiMinetest),
      children: undefined,
    },
    {
      label: "Customers",
      href: `#`,
      icon: React.createElement(SiMinetest),
      children: [
        { label: "All Customers", href: `/dashboard/customers${queryParam}` },
        { label: "Add Customer", href: `/dashboard/customers/create${queryParam}` },
        { label: "Customer Groups", href: `#` },
      ],
    },
    {
      label: "Sales",
      href: `#`,
      icon: React.createElement(SiMinetest),
      children: [
        { label: "All Leads", href: `#` },
        { label: "Opportunities", href: `#` },
        { label: "Deals", href: `#` },
        { label: "Pipeline", href: `#` },
      ],
    },
    {
      label: "Reports",
      href: `#`,
      icon: React.createElement(SiMinetest),
      children: [
        { label: "Sales Reports", href: `#` },
        { label: "Customer Reports", href: `#` },
        { label: "Analytics", href: `#` },
      ],
    },
    {
      label: "Settings",
      href: `#`,
      icon: React.createElement(SiMinetest),
      children: [
        { label: "Profile", href: `/dashboard/profile${queryParam}` },
        { label: "Team", href: `#` },
        { label: "Integrations", href: `#` },
        { label: "Billing", href: `#` },
      ],
    },
  ];
}
