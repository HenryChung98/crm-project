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
export function createCrmNavItems(orgId: string) {
  return [
    {
      label: "Dashboard",
      href: `/orgs/${orgId}/dashboard`,
      icon: React.createElement(RiDashboardLine),
    },
    {
      label: "Contacts",
      icon: React.createElement(RiGroupLine),
      children: [
        { label: "All Contacts", href: `/orgs/${orgId}/crmcontact` },
        { label: "Add Contact", href: `/orgs/${orgId}/contacts/create` },
      ],
    },
    {
      label: "Sales",
      icon: React.createElement(RiLineChartLine),
      children: [
        { label: "All Leads", href: `#` },
        { label: "Products", href: `/orgs/${orgId}/sales/products` },
        { label: "Deals", href: `#` },
        { label: "Pipeline", href: `/orgs/${orgId}/sales/pipeline` },
      ],
    },
    {
      label: "Reports",
      icon: React.createElement(RiFileTextLine),
      children: [
        { label: "Activity Logs", href: `/orgs/${orgId}/activity-logs` },
        { label: "Customer Reports", href: `#` },
        { label: "Analytics", href: `#` },
      ],
    },
    {
      label: "Settings",
      icon: React.createElement(RiSettings3Line),
      children: [
        { label: "Profile", href: `/orgs/${orgId}/settings/profile` },
        { label: "Activity Logs", href: `/orgs/${orgId}/settings/log` },
        { label: "Billing", href: `/orgs/${orgId}/settings/billing` },
        { label: "Team", href: `#` },
        { label: "Integrations", href: `#` },
      ],
    },
  ];
}