import React from "react";
import { 
  RiDashboardLine,    
  RiGroupLine,        
  RiLineChartLine,    
  RiFileTextLine,    
  RiSettings3Line    
} from 'react-icons/ri';

export interface NavItemType {
  label: string;
  href: string;
  children?: NavItemType[];
}

export interface CRMNavItemType extends NavItemType {
  icon?: React.ReactNode;
}

// before sign in navbar
// export const navItems: NavItemType[] = [
//   {
//     label: "menu1",
//     href: "#",
//     children: [{ label: "submenu1", href: "#" }],
//   },
// ];

// after sign in navbar
export function createCrmNavItems(searchParams: URLSearchParams): CRMNavItemType[] {
  const queryString = searchParams.toString();
  const queryParam = queryString ? `?${queryString}` : "";

  return [
    {
      label: "Dashboard",
      href: `/dashboard${queryParam}`,
      icon: React.createElement(RiDashboardLine),
      children: undefined,
    },
    {
      label: "Customers",
      href: `#`,
      icon: React.createElement(RiGroupLine),
      children: [
        { label: "All Customers", href: `/dashboard/customers${queryParam}` },
        { label: "Add Customer", href: `/dashboard/customers/create${queryParam}` },
        { label: "Customer Logs", href: `/dashboard/customers/log${queryParam}` },
      ],
    },
    {
      label: "Sales",
      href: `#`,
      icon: React.createElement(RiLineChartLine),
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
      icon: React.createElement(RiFileTextLine),
      children: [
        { label: "Sales Reports", href: `#` },
        { label: "Customer Reports", href: `#` },
        { label: "Analytics", href: `#` },
      ],
    },
    {
      label: "Settings",
      href: `#`,
      icon: React.createElement(RiSettings3Line),
      children: [
        { label: "Profile", href: `/dashboard/settings/profile${queryParam}` },
        { label: "Team", href: `#` },
        { label: "Integrations", href: `#` },
        { label: "Billing", href: `/dashboard/settings/billing${queryParam}` },
      ],
    },
  ];
}
