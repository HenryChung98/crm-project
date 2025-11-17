import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "muted" | "accent";
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  disabled = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle = `px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${className}`;
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
    muted:
      "bg-[var(--muted)] text-[var(--muted-foreground)] hover:opacity-80 focus:ring-[var(--muted)]",
    accent:
      "bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-80 focus:ring-[var(--accent)]",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled}
      {...props}
    />
  );
}
