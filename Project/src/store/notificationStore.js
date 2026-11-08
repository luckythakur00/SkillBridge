import { create } from 'zustand';
import { notificationService } from '../services/notificationService';
import { onSessionEnd, runLoad } from './sessionReset';

const initialState = { items: [], loading: {}, errors: {} };

export const useNotificationStore = create((set) => ({
  ...initialState,

  fetch: () => runLoad(set, 'items', notificationService.list, (items) => ({ items })),

  markRead: async (id) => {
    await notificationService.markRead(id);
    set((state) => ({ items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)) }));
  },

  markAllRead: async () => {
    await notificationService.markAllRead();
    set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) }));
  },

  remove: async (id) => {
    await notificationService.remove(id);
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },
}));

export const selectUnreadCount = (state) => state.items.reduce((count, item) => count + (item.read ? 0 : 1), 0);

onSessionEnd(() => useNotificationStore.setState(initialState));
