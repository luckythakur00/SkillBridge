const CURRENCY_SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£', SGD: 'S$' };
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', options);
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function daysUntil(value) {
  if (!value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / DAY_MS);
}

export function formatDeadline(value) {
  const days = daysUntil(value);
  if (days === null) return 'No deadline';
  if (days < 0) return `Closed ${formatDate(value)}`;
  if (days === 0) return 'Closes today';
  if (days === 1) return 'Closes tomorrow';
  if (days <= 14) return `${days} days left`;
  return `Apply by ${formatDate(value, { day: 'numeric', month: 'short' })}`;
}

export function timeAgo(value) {
  if (!value) return '';
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

const groupNumber = (value, currency) =>
  Number(value).toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US');

export function formatCompensation(compensation) {
  if (!compensation || (!compensation.min && !compensation.max)) return 'Unpaid';
  const { min, max, currency = 'INR', period = 'MONTH' } = compensation;
  const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  const low = min || max;
  const range =
    max && max !== low
      ? `${symbol}${groupNumber(low, currency)} – ${groupNumber(max, currency)}`
      : `${symbol}${groupNumber(low, currency)}`;
  return `${range} / ${period === 'YEAR' ? 'year' : 'month'}`;
}

export function formatFee(fee) {
  if (!fee || !fee.amount) return 'Free';
  const symbol = CURRENCY_SYMBOL[fee.currency] ?? `${fee.currency} `;
  return `${symbol}${groupNumber(fee.amount, fee.currency)}`;
}

export function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initials(name = '') {
  const parts = name.replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, '').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('') || '?';
}

export const pluralize = (count, word, plural = `${word}s`) => `${count} ${count === 1 ? word : plural}`;

// Value for <input type="date"> from an ISO date.
export const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');
