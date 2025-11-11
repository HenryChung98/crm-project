/**
 * Checks if the provided string is a valid email address.
 *
 * Uses a simple regex pattern to validate the general structure of an email:
 * "local-part@domain". The regex allows any non-whitespace characters before
 * and after the '@' symbol, ensuring there is at least one '.' in the domain part.
 *
 * @param email - The email string to validate.
 * @returns true if the email matches the pattern, false otherwise.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Validates a password string based on minimum complexity rules.
 *
 * Current regex enforces:
 * - At least 8 characters
 * - At least one letter
 * - At least one number
 *
 * A more strict version (commented) requires:
 * - Minimum 12 characters
 * - Uppercase + lowercase letters
 * - Numbers
 * - Symbols
 *
 * @param password - The password string to validate.
 * @returns true if the password meets the complexity requirements, false otherwise.
 */
export function isValidPassword(password: string): boolean {
  const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  // min 12, upper + num + symbol
  // const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^()_+\-=\[\]{};:'",.<>\/\\|`~])[A-Za-z\d@$!%*#?&^()_+\-=\[\]{};:'",.<>\/\\|`~]{12,}$/;
  return pwRegex.test(password);
}

/**
 * Checks whether a given UTC datetime string has expired relative to the current time.
 *
 * @param endsAt - UTC datetime string (ISO 8601) representing the expiration time.
 * @returns true if the current time is past the expiration, false otherwise.
 */
export function isExpired(endsAt: string): boolean {
  if (endsAt) return false;
  return new Date(endsAt).getTime() < Date.now();
}
