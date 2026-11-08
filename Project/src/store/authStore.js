import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { configureApiClient } from '../services/apiClient';
import { resetSessionStores } from './sessionReset';

const STORAGE_KEY = 'skillbridge.session';
const REMEMBER_KEY = 'skillbridge.remember';

// "Remember this device" keeps the session in localStorage. Otherwise it ends with the browser tab.
const sessionStorageAdapter = {
  getItem: (name) => {
    try {
      return sessionStorage.getItem(name) ?? localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      const remember = localStorage.getItem(REMEMBER_KEY) === 'true';
      (remember ? localStorage : sessionStorage).setItem(name, value);
    } catch {
      // Storage is blocked: the session lasts until the page reloads.
    }
  },
  removeItem: (name) => {
    try {
      sessionStorage.removeItem(name);
      localStorage.removeItem(name);
    } catch {
      // Nothing to clean up.
    }
  },
};

function setRemember(remember) {
  try {
    localStorage.setItem(REMEMBER_KEY, String(remember));
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is blocked: nothing to remember.
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      signedOut: false, // True after a deliberate logout, so route guards go home instead of to login.

      login: async ({ remember = false, ...credentials }) => {
        const { user, token } = await authService.login(credentials);
        setRemember(remember);
        resetSessionStores();
        set({ user, token, signedOut: false });
        return user;
      },

      register: async (payload) => {
        const { user, token } = await authService.register(payload);
        setRemember(false);
        resetSessionStores();
        set({ user, token, signedOut: false });
        return user;
      },

      logout: ({ expired = false } = {}) => {
        resetSessionStores();
        set({ user: null, token: null, signedOut: !expired });
      },

      refreshUser: async () => {
        if (!get().token) return;
        const user = await authService.me();
        set({ user });
      },

      changePassword: (payload) => authService.changePassword(payload),

      updatePreferences: async (preferences) => {
        const user = await authService.updatePreferences(preferences);
        set({ user });
      },

      deleteAccount: async () => {
        await authService.deleteAccount();
        get().logout();
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorageAdapter),
      // Only the session is persisted. Everything else is reloaded from the API.
      partialize: ({ user, token }) => ({ user, token }),
    },
  ),
);

configureApiClient({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().logout({ expired: true }),
});
