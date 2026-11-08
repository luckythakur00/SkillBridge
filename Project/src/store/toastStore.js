import { create } from 'zustand';

let nextId = 1;

export const useToastStore = create((set) => ({
  toasts: [],
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  show: (message, tone = 'success') => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, 4500);
  },
}));

export const toast = {
  success: (message) => useToastStore.getState().show(message, 'success'),
  error: (message) => useToastStore.getState().show(message, 'error'),
  info: (message) => useToastStore.getState().show(message, 'info'),
};
