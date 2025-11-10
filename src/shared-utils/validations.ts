export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  // min 12, upper + num + symbol
  // const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^()_+\-=\[\]{};:'",.<>\/\\|`~])[A-Za-z\d@$!%*#?&^()_+\-=\[\]{};:'",.<>\/\\|`~]{12,}$/;
  return pwRegex.test(password);
}

export function isExpired(endsAt: string): boolean {
  if (endsAt) return false;
  return new Date(endsAt).getTime() < Date.now();
}