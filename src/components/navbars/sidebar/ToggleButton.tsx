// components/sidebar/ToggleButton.tsx
interface ToggleButtonProps {
    isCollapsed: boolean;
    onClick: () => void;
  }
  
  export default function ToggleButton({ isCollapsed, onClick }: ToggleButtonProps) {
    const baseClasses =
      "bg-background z-50 p-2 border-2 rounded-lg shadow-sm hover:bg-accent transition-all duration-300 ease-in-out fixed top-1/2 -translate-y-1/2";
    const positionClasses = isCollapsed ? "-left-2" : "left-60";
    const responsiveClasses = "md:block";
  
    return (
      <>
        <button onClick={onClick} className={`${baseClasses} ${positionClasses} md:hidden`}>
          <svg className="w-2 h-15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              d={isCollapsed ? "M6 3l12 9-12 9" : "M18 21L6 12l12-9"}
            />
          </svg>
        </button>
  
        <button
          onClick={onClick}
          className={`hidden ${responsiveClasses} ${baseClasses} ${positionClasses}`}
        >
          <svg className="w-2 h-15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              d={isCollapsed ? "M6 3l12 9-12 9" : "M18 21L6 12l12-9"}
            />
          </svg>
        </button>
      </>
    );
  }