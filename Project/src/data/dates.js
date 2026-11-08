// Seed dates are relative to today, so the demo data never looks stale or expired.
const DAY_MS = 24 * 60 * 60 * 1000;

export const daysFromNow = (days) => new Date(Date.now() + days * DAY_MS).toISOString();
export const daysAgo = (days) => daysFromNow(-days);
