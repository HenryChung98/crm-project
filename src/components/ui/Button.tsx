import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const baseStyle = `px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition  ${className}`;
  const variants: Record<string, string> = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-80 focus:ring-[var(--primary)]",
    secondary:
      "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80 focus:ring-[var(--secondary)]",
    danger: "bg-danger text-[var(--danger-foreground)] hover:opacity-80 focus:ring-[var(--danger)]",
    success:
      "bg-[var(--success)] text-[var(--success-foreground)] hover:opacity-80 focus:ring-[var(--success)]",
    warning:
      "bg-[var(--warning)] text-[var(--warning-foreground)] hover:opacity-80 focus:ring-[var(--warning)]",
  };

  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />;
}
