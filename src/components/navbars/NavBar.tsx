"use client";

import Link from "next/link";
import { MouseEventHandler } from "react";

import { useAuth } from "@/contexts/AuthContext";

import { FiSearch, FiMenu, FiX } from "react-icons/fi";

import { useNavStore } from "@/store/useNavStore";
import { navItems } from "@/utils/data/navigation";
import { AuthUserType } from "@/types/authuser";

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// components
const SearchButton = ({ onClick }: { onClick: MouseEventHandler<HTMLButtonElement> }) => (
  <button onClick={onClick} className="pl-3 md:pl-5" aria-label="Open search">
    <FiSearch size={24} className="text-gray-700 hover:opacity-50 transition duration-200" />
  </button>
);

const MobileMenuButton = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => (
  <button onClick={onClick} className="text-gray-800 md:hidden pl-5" aria-label="Toggle menu">
    {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
  </button>
);

const Logo = () => (
  <Link
    href="/"
    className="flex-1 flex justify-center font-extrabold text-xl text-gray-800 hover:opacity-50 transition duration-200"
  >
    LOGO
  </Link>
);

const AuthLink = ({ user }: { user: AuthUserType | null }) => (
  <Link
    href={user ? "/dashboard" : "/auth/signin"}
    className="text-gray-700 hover:opacity-50 transition duration-200"
  >
    {user ? "dashboard" : "sign in"}
  </Link>
);
// /components

// for desktop
const DesktopNavigation = () => (
  <div className="hidden md:block">
    <div className="w-full border-b-2 py-2 border-gray-200" />
    <div className="flex justify-center mt-4 relative">
      {navItems.map((item: NavItem) => (
        <div key={item.label} className="group">
          <Link
            href={item.href}
            className="text-gray-700 hover:opacity-50 transition duration-200 px-5 py-1"
          >
            {item.label}
          </Link>
          {item.children && (
            <div className="absolute top-full left-0 w-full z-50">
              <div className="hidden group-hover:flex justify-center bg-white border-t border-gray-200 shadow-md">
                <ul className="flex gap-6 py-4 px-6 max-w-7xl w-1/3 justify-center">
                  {item.children.map((child: NavItem) => (
                    <li key={child.label}>
                      <Link
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:opacity-50 transition duration-200"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// for mobile submenu
const MobileSubMenu = ({
  item,
  onBack,
  onClose,
}: {
  item: NavItem;
  onBack: MouseEventHandler<HTMLButtonElement>;
  onClose: MouseEventHandler<HTMLAnchorElement>;
}) => (
  <div className="fixed top-0 left-0 w-full h-screen bg-white z-50 p-4 overflow-auto">
    <div className="flex">
      <button onClick={onBack} className="text-gray-700 text-2xl mb-4 ml-2">
        &lt;
      </button>
      <h2 className="text-xl font-semibold mb-4 absolute left-1/2 -translate-x-1/2">
        {item.label}
      </h2>
    </div>
    <ul className="space-y-3">
      {item.children?.map((child: NavItem) => (
        <li key={child.label}>
          <Link href={child.href} onClick={onClose} className="block text-gray-800 p-2">
            {child.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

// for mobile
const MobileMenu = ({
  isOpen,
  selectedItem,
  onItemSelect,
  onBack,
  onClose,
}: {
  isOpen: boolean;
  selectedItem: NavItem | null;
  onItemSelect: (item: NavItem) => void;
  onBack: () => void;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden h-screen bg-white mt-2 px-4 pt-2 pb-4 space-y-2 shadow-md rounded-md">
      {selectedItem ? (
        <MobileSubMenu item={selectedItem} onBack={onBack} onClose={onClose} />
      ) : (
        navItems.map((item: NavItem) => (
          <button
            key={item.label}
            onClick={() => (item.children ? onItemSelect(item) : onClose())}
            className="block w-full text-left text-gray-800 p-2"
          >
            {item.label}
          </button>
        ))
      )}
    </div>
  );
};

// search overlay
const SearchOverlay = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: MouseEventHandler<HTMLButtonElement>;
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-white/90 z-[100] flex justify-between md:justify-center items-center animate-fade-in">
      <div className="w-5/6 md:w-1/2 flex items-center px-5">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search for products"
            className="w-full py-3 pl-4 pr-16 bg-gray-200 border rounded outline-none placeholder-gray-400"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-0 pr-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Search"
          >
            <FiSearch size={24} />
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute right-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Close search"
        >
          <FiX size={32} />
        </button>
      </div>
    </div>
  );
};

export default function NavBar() {
  const { user } = useAuth();
  const {
    mobileMenuOpen,
    isSearchOpen,
    selectedMobileItem,
    setSelectedMobileItem,
    toggleMobileMenu,
    toggleSearch,
    closeAll,
  } = useNavStore();

  return (
    <header className="relative fixed top-0 z-50 w-full md:h-auto transition-transform duration-300 shadow-md md:translate-y-0 md:static">
      <nav className="w-full py-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-5">
            <MobileMenuButton isOpen={mobileMenuOpen} onClick={toggleMobileMenu} />
            <SearchButton onClick={toggleSearch} />
          </div>
          <Logo />
          <div className="flex items-center gap-5">
            <AuthLink user={user} />
          </div>
        </div>

        <DesktopNavigation />

        <MobileMenu
          isOpen={mobileMenuOpen}
          selectedItem={selectedMobileItem}
          onItemSelect={setSelectedMobileItem}
          onBack={() => setSelectedMobileItem(null)}
          onClose={closeAll}
        />

        <SearchOverlay isOpen={isSearchOpen} onClose={toggleSearch} />
      </nav>
    </header>
  );
}
