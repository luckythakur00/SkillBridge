import { createSeedData } from '../data/mockData';

// The mock database lives in localStorage so that all demo accounts share data in one browser.
const STORAGE_KEY = 'skillbridge.mockdb.v1';

const createFreshDb = () => structuredClone(createSeedData());

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Storage is blocked or the data is corrupt: fall back to fresh seed data.
  }
  return createFreshDb();
}

let database = load();

export const getDb = () => database;

export function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  } catch {
    // Storage is full or blocked: changes stay in memory until the page reloads.
  }
}

export function resetDb() {
  database = createFreshDb();
  saveDb();
}

let counter = 0;
export const newId = (prefix) => {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
};
