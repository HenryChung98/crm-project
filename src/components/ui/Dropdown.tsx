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
    <div className={`${className}`}>
      <label className="block mb-1">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
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
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
