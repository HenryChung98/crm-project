// validation.ts
type ValidationRule = (value: string) => string;

const orgNameValidators: ValidationRule[] = [
  (value) => (!value || value.length < 1 ? "SILENT_ERROR" : ""),
  (value) => (value.length < 2 ? "Organization name must be at least 2 characters" : ""),
  (value) => (value.length > 100 ? "Organization name cannot exceed 100 characters" : ""),
];

const orgCountryValidators: ValidationRule[] = [
  (value) => (!value ? "SILENT_ERROR" : ""),
];

const orgProvinceValidators: ValidationRule[] = [
  (value) => (!value || value.length < 1 ? "SILENT_ERROR" : ""),
  (value) => (value.length !== 2 && value.length > 0 ? "Province code must be exactly 2 characters" : ""),
];

const orgCityValidators: ValidationRule[] = [
  (value) => (!value || value.length < 1 ? "SILENT_ERROR" : ""),
  (value) => (value.length < 2 ? "City name must be at least 2 characters" : ""),
];

const urlValidators: ValidationRule[] = [
  (value) => {
    if (!value) return "";
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return !urlPattern.test(value) ? "Please enter a valid URL" : "";
  },
];

const validators: Record<string, ValidationRule[]> = {
  orgName: orgNameValidators,
  orgCountry: orgCountryValidators,
  orgProvince: orgProvinceValidators,
  orgCity: orgCityValidators,
  url: urlValidators,
};

export const validateOrganizationField = (name: string, value: string): string => {
  const fieldValidators = validators[name];
  if (!fieldValidators) return "";

  for (const validator of fieldValidators) {
    const error = validator(value);
    if (error) return error;
  }

  return "";
};