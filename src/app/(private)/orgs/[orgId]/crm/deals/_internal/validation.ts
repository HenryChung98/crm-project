// validation.ts
type ValidationRule = (value: string) => string;

const nameValidators: ValidationRule[] = [
  (value) => (!value || value.length < 1 ? "SILENT_ERROR" : ""),
  (value) => (value.length < 2 ? "Name must be at least 2 characters" : ""),
];

const stageValidators: ValidationRule[] = [(value) => (!value ? "SILENT_ERROR" : "")];

const contactValidators: ValidationRule[] = [(value) => (!value ? "SILENT_ERROR" : "")];

const productValidators: ValidationRule[] = [(value) => (!value ? "SILENT_ERROR" : "")];

const validators: Record<string, ValidationRule[]> = {
  name: nameValidators,
  stage: stageValidators,
  contact: contactValidators,
  product: productValidators,
};

export const validateDealField = (name: string, value: string): string => {
  const fieldValidators = validators[name];
  if (!fieldValidators) return "";

  for (const validator of fieldValidators) {
    const error = validator(value);
    if (error) return error;
  }

  return "";
};
