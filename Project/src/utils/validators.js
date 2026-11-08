import { PASSWORD_MIN_LENGTH } from '../config/app';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const required = (label = 'This field') => (value) => {
  const empty = value === undefined || value === null || String(value).trim() === '';
  return empty ? `${label} is required.` : '';
};

export const email = () => (value) =>
  value && !EMAIL_PATTERN.test(String(value).trim()) ? 'Enter a valid email address.' : '';

export const password = () => (value) =>
  value && value.length < PASSWORD_MIN_LENGTH ? `Use at least ${PASSWORD_MIN_LENGTH} characters.` : '';

export const url = () => (value) => {
  if (!value) return '';
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:' ? '' : 'Enter a link starting with https://';
  } catch {
    return 'Enter a full link, such as https://example.com';
  }
};

export const phone = () => (value) =>
  value && !/^[+]?[\d\s()-]{7,20}$/.test(value) ? 'Enter a valid phone number.' : '';

export const numberRange = (min, max, label = 'Value') => (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return `${label} must be a number.`;
  if (parsed < min || parsed > max) return `${label} must be between ${min} and ${max}.`;
  return '';
};

export const futureDate = (label = 'Date') => (value) => {
  if (!value) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(value) < today ? `${label} cannot be in the past.` : '';
};

export const matches = (otherField, message) => (value, values) =>
  value !== values[otherField] ? message : '';

export const mustAccept = (message) => (value) => (value ? '' : message);

// schema: { fieldName: [rule, rule] }. Returns { fieldName: firstErrorMessage }.
export function validate(schema, values) {
  const errors = {};
  Object.entries(schema).forEach(([field, rules]) => {
    for (const rule of rules) {
      const message = rule(values[field], values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  });
  return errors;
}

export function validateFile(file, { extensions, maxBytes }) {
  const name = file.name.toLowerCase();
  if (!extensions.some((ext) => name.endsWith(ext))) {
    return `Upload a ${extensions.join(', ')} file.`;
  }
  if (file.size > maxBytes) {
    const limit = maxBytes >= 1024 * 1024 ? `${maxBytes / (1024 * 1024)} MB` : `${maxBytes / 1024} KB`;
    return `File must be ${limit} or smaller.`;
  }
  return '';
}
