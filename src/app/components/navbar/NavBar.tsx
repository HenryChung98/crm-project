'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiSearch, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { RiAccountCircleLine } from 'react-icons/ri';
import { useNavStore } from '@/lib/store/useNavStore';
import DesktopNav from './DesktopNav';
import MobileMenu from './MobileMenu';
import SearchOverlay from './SearchOverlay';

import { useSupabase } from '@/hooks/useSupabase';

export default function NavBar() {

  const { user, signOut } = useSupabase();

  // State for tracking navbar visibility on scroll
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Zustand store for managing navigation state
  const { mobileMenuOpen, isSearchOpen, toggleMobileMenu, toggleSearch } =
    useNavStore();

  // Effect to handle navbar visibility on scroll
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(
            currentScrollY < lastScrollY.current || currentScrollY < 10
          );
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Base style for navigation items
  const baseItemStyle =
    'text-gray-700 hover:opacity-50 transition duration-200 block';

  return (
    <>
      <header
        className={`relative fixed top-0 z-50 w-full md:h-auto transition-transform duration-300 bg-white shadow-md ${
          isVisible ? 'translate-y-0 ' : '-translate-y-full'
        } md:translate-y-0 md:static`}
      >
        <nav className="w-full py-4">
          {/* Header section with logo and icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-5">
              {/* Mobile menu toggle button */}
              <button
                onClick={toggleMobileMenu}
                className="text-gray-800 md:hidden pl-5"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              {/* Search button */}
              <button
                onClick={toggleSearch}
                className="pl-3 md:pl-5"
                aria-label="Open search"
              >
                <FiSearch size={24} className={baseItemStyle} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-1 flex justify-center">
              <Link
                href="/"
                className={`font-extrabold text-xl text-gray-800 border-gray-800 ${baseItemStyle}`}
              >
                LOGO
              </Link>
            </div>

            {/* Account and Cart icons */}
            <div className="flex items-center gap-5">
              <Link href={user ? "/profile" : "/signin"}>
                <RiAccountCircleLine size={24} className={baseItemStyle} />
              </Link>
              <Link href="#" className="pr-5">
                <FiShoppingCart size={24} className={baseItemStyle} />
              </Link>
            </div>
          </div>

          {/* Desktop navigation */}
          <DesktopNav />

          {/* Mobile menu (conditionally rendered) */}
          {mobileMenuOpen && <MobileMenu />}

          {/* Search overlay (conditionally rendered) */}
          {isSearchOpen && <SearchOverlay onClose={toggleSearch} />}
        </nav>
        <button onClick={signOut} className='border text-black'>sign out</button>
      </header>
    </>
  );
}
