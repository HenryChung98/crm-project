interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Dropdown({
  children,
  label,
  error,
  className = "",
  required,
  ...props
}: DropdownProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        className={`
            w-full px-3 py-2 
            border border-border rounded-md
            bg-input text-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-destructive" : ""}
            ${className}
          `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
