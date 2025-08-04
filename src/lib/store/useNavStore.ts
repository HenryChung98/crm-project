
import { create } from 'zustand';
import { NavItemType } from '@/types/nav';

interface NavState {
  mobileMenuOpen: boolean;
  isSearchOpen: boolean;
  selectedMobileItem: NavItemType | null;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  setSelectedMobileItem: (item: NavItemType | null) => void;
  closeAll: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  mobileMenuOpen: false,
  isSearchOpen: false,
  selectedMobileItem: null,
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen, selectedMobileItem: null })),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setSelectedMobileItem: (item) => set({ selectedMobileItem: item }),
  closeAll: () => set({ mobileMenuOpen: false, isSearchOpen: false, selectedMobileItem: null }),
}));
