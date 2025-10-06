import React from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function FormField({ label, className = "", required = false, ...props }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        className={`placeholder-gray-400 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}
