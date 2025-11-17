type ValidationRule = (value: string | number | null) => string;

const nameValidators: ValidationRule[] = [
  (value) => (typeof value === "string" && value.length < 1 ? "SILENT_ERROR" : ""),
];

const skuValidators: ValidationRule[] = [
  (value) => (typeof value === "string" && value.length < 1 ? "SILENT_ERROR" : ""),
  (value) =>
    typeof value === "string" && value.length < 3 ? "SKU must be at least 3 characters" : "",
  (value) =>
    typeof value === "string" && !/^[A-Z0-9-]+$/.test(value)
      ? "SKU must contain only uppercase, numbers, and hyphens"
      : "",
];

const typeValidators: ValidationRule[] = [(value) => (value === "" ? "SILENT_ERROR" : "")];

const priceValidators: ValidationRule[] = [
  (value) => (typeof value === "string" && value.length < 1 ? "SILENT_ERROR" : ""),
  (value) =>
    typeof value === "string" && isNaN(Number(value)) ? "Price must be a valid number" : "",
  (value) => (value !== null && Number(value) < 0 ? "Price cannot be negative" : ""),
  (value) => (value !== null && Number(value) > 1000000 ? "Price cannot exceed 1,000,000" : ""),
];

const costValidators: ValidationRule[] = [
  (value) => (typeof value === "string" && value.length < 1 ? "SILENT_ERROR" : ""),
  (value) =>
    typeof value === "string" && isNaN(Number(value)) ? "Cost must be a valid number" : "",
  (value) => (value !== null && Number(value) < 0 ? "Cost cannot be negative" : ""),
];

const validators: Record<string, ValidationRule[]> = {
  name: nameValidators,
  sku: skuValidators,
  type: typeValidators,
  price: priceValidators,
  cost: costValidators,
};

export const validateProductField = (name: string, value: string | number | null): string => {
  const fieldValidators = validators[name];
  if (!fieldValidators) return "";

  for (const validator of fieldValidators) {
    const error = validator(value);
    if (error) return error;
  }

  return "";
};
