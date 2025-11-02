import React from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  // nameForLabel: string;
}

export function FormField({
  label,
  className = "",
  name,
  required = false,
  ...props
}: FormFieldProps) {
  return (
    <div>
      <div className="flex gap-1">
        <label className="block text-sm font-medium mb-1" htmlFor={name}>
          {label}
        </label>
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <input
        id={name}
        name={name}
        className={`placeholder-gray-400 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}
