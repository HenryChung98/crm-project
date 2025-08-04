"use client";

import { FiSearch, FiX } from "react-icons/fi";

interface SearchOverlayProps {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  return (
    <div className="absolute inset-0 bg-white/90 z-[100] flex justify-between md:justify-center items-center animate-fade-in">
      <div className="w-5/6 md:w-1/2 flex items-center px-5">
        {/* input box, search button */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search for products"
            className="w-full py-3 pl-4 pr-16 bg-gray-200 rounded outline-none"
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

        {/* close button */}
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
}
