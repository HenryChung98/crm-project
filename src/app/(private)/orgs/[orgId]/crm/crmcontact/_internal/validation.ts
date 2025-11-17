// validateContactForm.ts
type ValidationRule = (value: string | number | null) => string;

const nameValidators: ValidationRule[] = [
  (value) => (typeof value === "string" && value.length < 1 ? "SILENT_ERROR" : ""),
  (value) => (typeof value === "string" && value.length < 2 ? "Invalid name" : ""),
];

const emailValidators: ValidationRule[] = [
  (value) => (typeof value === "string" && value.length < 1 ? "SILENT_ERROR" : ""),
  (value) =>
    typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? "Invalid email format"
      : "",
];

const statusValidators: ValidationRule[] = [
  (value) => (value === "" ? "SILENT_ERROR" : ""),
];

const phoneValidators: ValidationRule[] = [
  (value) => {
    if (!value || value === "") return "";
    return typeof value === "string" && !/^[0-9+\-\s()]+$/.test(value)
      ? "Invalid phone format"
      : "";
  },
];

const validators: Record<string, ValidationRule[]> = {
  name: nameValidators,
  email: emailValidators,
  status: statusValidators,
  phone: phoneValidators,
};

export const validateContactField = (name: string, value: string | number | null): string => {
  const fieldValidators = validators[name];
  if (!fieldValidators) return "";

  for (const validator of fieldValidators) {
    const error = validator(value);
    if (error) return error;
  }

  return "";
};