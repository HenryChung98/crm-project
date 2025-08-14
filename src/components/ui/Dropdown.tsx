interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Dropdown({ children, error, className = "", ...props }: DropdownProps) {
  return (
    <div className="w-full">
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
