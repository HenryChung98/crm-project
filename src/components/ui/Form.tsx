import React from "react";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  formTitle: string;
}

export function Form({ children, formTitle, className = "", ...props }: FormProps) {
  return (
    <form
      className={`w-1/3 m-auto space-y-4 p-4 bg-var(--background) text-var(--foreground) border rounded-lg shadow-sm ${className}`}
      {...props}
    >
      <h3 className="text-xl font-semibold">{formTitle}</h3>
      {children}
    </form>
  );
}
