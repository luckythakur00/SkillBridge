// Change the product name here and it updates everywhere in the app.
// The browser tab title in index.html is the only other place to update.
export const APP_NAME_PARTS = ['Skill', 'Bridge']; // The second part appears in the accent colour.
export const APP_NAME = APP_NAME_PARTS.join('');
export const APP_TAGLINE = 'Academia & Industry';

// Set VITE_API_BASE_URL (see .env.example) to switch from the mock API to a real backend.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const USE_MOCK_API = !API_BASE_URL;

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];
export const MAX_LOGO_BYTES = 200 * 1024;
export const LOGO_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
export const PASSWORD_MIN_LENGTH = 8;
