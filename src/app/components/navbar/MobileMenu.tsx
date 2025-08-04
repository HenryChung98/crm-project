"use client";

import Link from "next/link";

import { useNavStore } from "@/lib/store/useNavStore";
import { navItems } from "@/lib/data/navigation";
import { NavItemType } from "@/types/nav";

export default function MobileMenu() {
  // Zustand store for managing mobile menu state
  const {
    mobileMenuOpen,
    selectedMobileItem,
    setSelectedMobileItem,
    closeAll,
  } = useNavStore();

  // Render sub-menu if a mobile item is selected
  if (selectedMobileItem) {
    return (
      <div className="fixed top-0 left-0 w-full h-screen bg-white z-50 p-4 overflow-auto tilt-in-right-1">
        {/* Back button for sub-menu */}
        <div className="flex">
          <button
            onClick={() => setSelectedMobileItem(null)}
            className="text-gray-700 text-2xl mb-4 ml-2"
          >
            &lt;
          </button>
          {/* Sub-menu title */}
          <h2 className="text-xl font-semibold mb-4 absolute left-1/2 -translate-x-1/2">
            {selectedMobileItem.label}
          </h2>
        </div>
        {/* Sub-menu items */}
        <ul className="space-y-3">
          {selectedMobileItem.children?.map((child: NavItemType) => (
            <li key={child.label}>
              <Link
                href={child.href}
                onClick={closeAll}
                className="block text-gray-800 p-2"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Render main mobile menu
  return (
    <div
      className="md:hidden h-screen bg-white mt-2 px-4 pt-2 pb-4 space-y-2 shadow-md rounded-md"
    >
      {/* Main navigation items */}
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            if (item.children) setSelectedMobileItem(item);
            else closeAll();
          }}
          className="block w-full text-left text-gray-800 p-2"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
