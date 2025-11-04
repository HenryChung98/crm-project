import Link from "next/link";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { NavItemType } from "@/components/navbars/sidebar/navigation";

interface NavItemProps {
  item: NavItemType;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const NavItem = ({ item, isActive, isExpanded, onToggle }: NavItemProps) => {
  const hasChildren = Boolean(item.children?.length);

  const handleItemClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      onToggle();
    }
  };

  const itemContent = (
    <>
      <span className="mr-3 text-lg">{item.icon}</span>
      <span className="font-medium">{item.label}</span>
    </>
  );

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
          isActive ? "bg-blue-100 text-blue-700" : "hover:opacity-50"
        }`}
        onClick={handleItemClick}
      >
        {item.href ? (
          <Link href={item.href} className="flex items-center flex-1">
            {itemContent}
          </Link>
        ) : (
          <div className="flex items-center flex-1">{itemContent}</div>
        )}

        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children?.map((child) => (
            <div key={child.label}>
              {child.href ? (
                <Link
                  href={child.href}
                  className="block p-2 text-sm text-text-secondary hover:opacity-50 rounded transition-colors"
                >
                  {child.label}
                </Link>
              ) : (
                <div className="block p-2 text-sm text-text-secondary opacity-50 rounded cursor-not-allowed">
                  {child.label}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
