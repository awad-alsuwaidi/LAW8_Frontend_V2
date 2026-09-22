import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Required after trimming whitespace */
export function trimRequired(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim();
    return value.length > 0 ? null : { required: true };
  };
}

/** Subdomain: lowercase letters, numbers, hyphens - no leading/trailing hyphen */
export function subdomainValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim();
    if (!value) return null;
    return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)
      ? null
      : { subdomain: true };
  };
}

/** Whole number >= min (default 1). Empty value is left to `required`. */
export function positiveInteger(min = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    return Number.isInteger(n) && n >= min ? null : { positiveInteger: { min } };
  };
}

/** Keys that would let a user type a non-positive or non-integer number into a numeric input. */
export const NON_DIGIT_KEYS = ['-', '+', 'e', 'E', '.', ','];

export function isDigitsOnly(text: string): boolean {
  return /^\d+$/.test(text.trim());
}

/** Coerce arbitrary input into a whole number >= min, or 0 when it is not one. */
export function coercePositiveInteger(value: unknown, min = 1): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= min ? n : 0;
}

/* ---------------------------------------------------------------------
 * Email
 * ------------------------------------------------------------------- */

/** Strict email: local@domain.tld, ASCII only, no spaces. */
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Empty value is left to `required`. */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim();
    if (!value) return null;
    return isValidEmail(value) ? null : { email: true };
  };
}

/** Characters an email address can never contain (blocked at keyboard level). */
export const EMAIL_BLOCKED_KEYS = [' ', ',', ';', '/', '\\', '<', '>', '(', ')', '[', ']', '"', "'"];

/* ---------------------------------------------------------------------
 * Phone
 * ------------------------------------------------------------------- */

/** Optional leading +, then 7-15 digits (E.164-style, no spaces/dashes stored). */
export const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

/** Remove everything except digits and a single leading +. */
export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/\D/g, '');
}

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(normalizePhone(value));
}

/** Empty value is left to `required`. */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim();
    if (!value) return null;
    return isValidPhone(value) ? null : { phone: true };
  };
}

/* ---------------------------------------------------------------------
 * Password
 * ------------------------------------------------------------------- */

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_SPECIAL = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/;

export interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function passwordChecks(value: string): PasswordChecks {
  const v = value ?? '';
  return {
    minLength:    v.length >= PASSWORD_MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(v),
    hasLowercase: /[a-z]/.test(v),
    hasNumber:    /[0-9]/.test(v),
    hasSpecial:   PASSWORD_SPECIAL.test(v),
  };
}

export function isStrongPassword(value: string): boolean {
  return Object.values(passwordChecks(value)).every(Boolean);
}

/** Empty value is left to `required`; any non-empty value must satisfy every rule. */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();
    if (!value) return null;
    return isStrongPassword(value) ? null : { strongPassword: passwordChecks(value) };
  };
}

/** Cryptographically random password that satisfies every rule (ambiguous glyphs excluded). */
export function generatePassword(length = 16): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*_-+=?';
  const all = upper + lower + digits + special;
  const rnd = new Uint32Array(length);
  crypto.getRandomValues(rnd);
  const pick = (set: string, i: number) => set[rnd[i] % set.length];
  const chars = [pick(upper, 0), pick(lower, 1), pick(digits, 2), pick(special, 3)];
  for (let i = 4; i < length; i++) chars.push(pick(all, i));
  // Fisher-Yates shuffle so the mandatory classes are not always at the front
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rnd[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
