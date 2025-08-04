import Link from "next/link";
import { navItems } from "@/lib/data/navigation";
import { NavItemType } from "@/types/nav";

// Component for a single navigation item with a dropdown menu
const NavItemWithDropdown = ({ item }: { item: NavItemType }) => {
  const baseItemStyle =
    "text-gray-700 hover:opacity-50 transition duration-200 block";

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="group">
      {/* Main navigation link */}
      <Link href={item.href} className={`${baseItemStyle} px-5 py-1`}>
        {item.label}
      </Link>

      {/* Dropdown menu (conditionally rendered) */}
      {hasChildren && (
        <div className="absolute top-full left-0 w-full z-50">
          <div className="hidden group-hover:flex justify-center bg-white border-t border-gray-200 shadow-md">
            <ul className="flex gap-6 py-4 px-6 max-w-7xl w-1/3 justify-center">
              {item.children?.map((child) => (
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
  );
};

// Component for the main desktop navigation bar
export default function DesktopNav() {
  return (
    <>
      {/* Divider line */}
      <div className="hidden md:block w-full border-b-2 py-2 border-gray-200" />
      {/* Navigation items container */}
      <div className="hidden md:flex justify-center mt-4 relative">
        {navItems.map((item) => (
          <NavItemWithDropdown key={item.label} item={item} />
        ))}
      </div>
    </>
  );
}
