import { NavItemType } from "@/types/nav";

export const navItems: NavItemType[] = [
  {
    label: "menu1",
    href: "#",
    children: [
      { label: "submenu1", href: "#" },
      { label: "submenu2", href: "#" },
      { label: "submenu3", href: "#" },
      { label: "submenu4", href: "#" },
      { label: "submenu5", href: "#" },
      { label: "submenu6", href: "#" },
    ],
  },
  {
    label: "menu2",
    href: "#",
    children: [
      { label: "submenu1", href: "#" },
      { label: "submenu2", href: "#" },
      { label: "submenu3", href: "#" },
    ],
  },
  {
    label: "menu3",
    href: "#",
    children: [{ label: "submenu", href: "#" }],
  },
];
