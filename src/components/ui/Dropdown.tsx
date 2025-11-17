interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Dropdown({
  children,
  label,
  error,
  name,
  className = "",
  required,
  ...props
}: DropdownProps) {
  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium mb-1" htmlFor={name}>
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name={name}
        className={`
            px-3 py-2 w-30 w-full
            border border-border rounded-lg
            bg-input text-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-danger" : ""}
          `}
        {...props}
      >
        {children}
      </select>
      {error && error !== "SILENT_ERROR" && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
}
