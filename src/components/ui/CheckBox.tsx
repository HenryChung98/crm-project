interface CheckboxContainerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  buttonLabel?: string;
  selectedCount?: number;
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  indeterminate?: boolean;
}

export const CheckboxContainer = ({
  children,
  isOpen,
  onToggle,
  buttonLabel = "Select Items",
  selectedCount = 0,
  className = "",
  ...props
}: CheckboxContainerProps) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`px-4 py-2 text-sm border rounded bg-background hover:opacity-50 ${className}`}
      >
        {buttonLabel} ({selectedCount})
      </button>

      {isOpen && (
        <div className="absolute top-full bg-background mt-2 p-4 border rounded shadow-lg w-[600px] max-h-[400px] overflow-auto z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export const Checkbox = ({ label, error, className = "", ...props }: CheckboxProps) => {
  return (
    <div className={`${className}`}>
      <label className="flex justify-between items-center gap-2 w-25">
        {label && <span className="text-sm">{label}</span>}
        <input
          type="checkbox"
          className={`
            sr-only peer
              rounded
              border-border
              text-primary
              focus:ring-2 focus:ring-ring
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? "border-destructive" : ""}
            `}
          {...props}
        />
        <div className="w-4 h-4 flex-shrink-0 min-w-4 min-h-4 border-2 border-gray-400 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
          <svg
            className="w-3 h-3 text-white hidden peer-checked:block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </label>
    </div>
  );
};
