import React from "react";
import {
  RiDashboardLine,
  RiGroupLine,
  RiLineChartLine,
  RiFileTextLine,
  RiSettings3Line,
} from "react-icons/ri";

export interface NavItemType {
  label: string;
  href?: string;
  children?: NavItemType[];
  icon?: React.ReactNode;
}

// after sign in navbar
export function createCrmNavItems(searchParams: URLSearchParams) {
  const queryString = searchParams.toString();
  const queryParam = queryString ? `?${queryString}` : "";

  return [
    {
      label: "Dashboard",
      href: `/dashboard${queryParam}`,
      icon: React.createElement(RiDashboardLine),
    },
    {
      label: "Customers",
      icon: React.createElement(RiGroupLine),
      children: [
        { label: "All Customers", href: `/customers${queryParam}` },
        { label: "Add Customer", href: `/customers/create${queryParam}` },
      ],
    },
    {
      label: "Sales",
      icon: React.createElement(RiLineChartLine),
      children: [
        { label: "All Leads", href: `#` },
        { label: "Products", href: `/sales/products${queryParam}` },
        { label: "Deals", href: `#` },
        { label: "Pipeline", href: `/sales/pipeline${queryParam}` },
      ],
    },
    {
      label: "Reports",
      icon: React.createElement(RiFileTextLine),
      children: [
        { label: "Sales Reports", href: `#` },
        { label: "Customer Reports", href: `#` },
        { label: "Analytics", href: `#` },
      ],
    },
    {
      label: "Settings",
      icon: React.createElement(RiSettings3Line),
      children: [
        { label: "Profile", href: `/settings/profile${queryParam}` },
        { label: "Activity Logs", href: `/settings/log${queryParam}` },
        { label: "Billing", href: `/settings/billing${queryParam}` },
        { label: "Team", href: `#` },
        { label: "Integrations", href: `#` },
      ],
    },
  ];
}
