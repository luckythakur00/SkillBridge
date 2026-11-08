import { create } from 'zustand';
import { recruiterService } from '../services/recruiterService';
import { onSessionEnd, runLoad } from './sessionReset';

const initialState = {
  organization: null,
  analytics: null,
  candidateResults: { items: [], total: 0, page: 1, totalPages: 1 },
  candidate: null,
  loading: {},
  errors: {},
};

export const useRecruiterStore = create((set) => ({
  ...initialState,

  fetchOrganization: () =>
    runLoad(set, 'organization', recruiterService.getOrganization, (organization) => ({ organization })),

  updateOrganization: async (changes) => {
    const organization = await recruiterService.updateOrganization(changes);
    set({ organization });
    return organization;
  },

  requestVerification: async () => {
    const organization = await recruiterService.requestVerification();
    set({ organization });
  },

  fetchAnalytics: () => runLoad(set, 'analytics', recruiterService.getAnalytics, (analytics) => ({ analytics })),

  searchCandidates: (params) =>
    runLoad(set, 'candidates', () => recruiterService.searchCandidates(params), (candidateResults) => ({ candidateResults })),

  fetchCandidate: (id) => {
    set({ candidate: null });
    return runLoad(set, 'candidate', () => recruiterService.getCandidate(id), (candidate) => ({ candidate }));
  },
}));

onSessionEnd(() => useRecruiterStore.setState(initialState));
