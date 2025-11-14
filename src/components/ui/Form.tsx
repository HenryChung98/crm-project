import React from "react";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  formTitle: string;
}

export function Form({ children, formTitle, className = "", ...props }: FormProps) {
  return (
    // <div className="flex justify-center items-center min-h-screen">
    <form
      className={`w-full m-auto space-y-8 p-10 bg-var(--background) text-var(--foreground) rounded-lg shadow-sm ${className}`}
      {...props}
    >
      <h3 className="text-xl font-semibold text-center">{formTitle}</h3>
      <p className="text-sm text-gray-500 text-right">
        Required fields <span className="text-red-500">*</span>
      </p>
      {children}
    </form>
    // </div>
  );
}
