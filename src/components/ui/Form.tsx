import React from "react";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  formTitle: string;
}

export function Form({ children, formTitle, className = "", ...props }: FormProps) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        className={`w-1/4 m-auto space-y-4 p-10 bg-var(--background) text-var(--foreground) rounded-lg shadow-sm border ${className}`}
        {...props}
      >
        <h3 className="text-xl font-semibold text-center">{formTitle}</h3>
        {/* <p className="text-sm text-gray-500 text-center">
          <span className="text-red-500">*</span> Required fields
        </p> */}
        {children}
      </form>
    </div>
  );
}
