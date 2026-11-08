import { create } from 'zustand';
import { applicationService } from '../services/applicationService';
import { onSessionEnd, runLoad } from './sessionReset';
import { useJobStore } from './jobStore';

const initialState = { mine: [], received: [], loading: {}, errors: {} };

const replaceById = (list, item) => list.map((entry) => (entry.id === item.id ? { ...entry, ...item } : entry));

export const useApplicationStore = create((set) => ({
  ...initialState,

  fetchMine: () => runLoad(set, 'mine', applicationService.mine, (mine) => ({ mine })),

  apply: async (payload) => {
    const application = await applicationService.apply(payload);
    set((state) => ({ mine: [application, ...state.mine] }));
    useJobStore.getState().markApplied(payload.opportunityId);
    return application;
  },

  withdraw: async (id) => {
    const application = await applicationService.withdraw(id);
    set((state) => ({ mine: replaceById(state.mine, application) }));
  },

  fetchReceived: (params) =>
    runLoad(set, 'received', () => applicationService.received(params), (received) => ({ received })),

  updateStatus: async (id, payload) => {
    const application = await applicationService.updateStatus(id, payload);
    set((state) => ({ received: replaceById(state.received, application) }));
    return application;
  },

  scheduleInterview: async (id, payload) => {
    const application = await applicationService.scheduleInterview(id, payload);
    set((state) => ({ received: replaceById(state.received, application) }));
    return application;
  },

  updateInternship: async (id, payload) => {
    const application = await applicationService.updateInternship(id, payload);
    set((state) => ({ received: replaceById(state.received, application) }));
    return application;
  },
}));

onSessionEnd(() => useApplicationStore.setState(initialState));
