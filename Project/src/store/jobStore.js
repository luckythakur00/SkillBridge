import { create } from 'zustand';
import { jobService } from '../services/jobService';
import { onSessionEnd, runLoad } from './sessionReset';

const initialState = {
  results: { items: [], total: 0, page: 1, totalPages: 1 },
  current: null,
  recommended: [],
  saved: [],
  postings: [],
  loading: {},
  errors: {},
};

const replaceById = (list, item) => list.map((entry) => (entry.id === item.id ? item : entry));

export const useJobStore = create((set, get) => ({
  ...initialState,

  search: (params) => runLoad(set, 'results', () => jobService.list(params), (results) => ({ results })),

  fetchOne: (id) => {
    set({ current: null });
    return runLoad(set, 'current', () => jobService.get(id), (current) => ({ current }));
  },

  fetchRecommended: () => runLoad(set, 'recommended', jobService.recommended, (recommended) => ({ recommended })),
  fetchSaved: () => runLoad(set, 'saved', jobService.saved, (saved) => ({ saved })),

  // Updates the bookmark everywhere it is displayed.
  toggleSaved: async (opportunity) => {
    const next = !opportunity.isSaved;
    if (next) await jobService.save(opportunity.id);
    else await jobService.unsave(opportunity.id);

    const mark = (entry) => (entry.id === opportunity.id ? { ...entry, isSaved: next } : entry);
    set((state) => ({
      results: { ...state.results, items: state.results.items.map(mark) },
      recommended: state.recommended.map(mark),
      current: state.current ? mark(state.current) : null,
      saved: next
        ? [{ ...opportunity, isSaved: true }, ...state.saved]
        : state.saved.filter((entry) => entry.id !== opportunity.id),
    }));
    return next;
  },

  markApplied: (opportunityId) => {
    const mark = (entry) => (entry.id === opportunityId ? { ...entry, applicationStatus: 'APPLIED' } : entry);
    set((state) => ({
      results: { ...state.results, items: state.results.items.map(mark) },
      saved: state.saved.map(mark),
      recommended: state.recommended.filter((entry) => entry.id !== opportunityId),
      current: state.current ? mark(state.current) : null,
    }));
  },

  // Recruiter postings
  fetchPostings: () => runLoad(set, 'postings', jobService.mine, (postings) => ({ postings })),

  createPosting: async (payload) => {
    const posting = await jobService.create(payload);
    set((state) => ({ postings: [posting, ...state.postings] }));
    return posting;
  },

  updatePosting: async (id, payload) => {
    const posting = await jobService.update(id, payload);
    set((state) => ({ postings: replaceById(state.postings, posting) }));
    return posting;
  },

  setPostingStatus: async (id, status) => {
    const posting = await jobService.setStatus(id, status);
    set((state) => ({ postings: replaceById(state.postings, posting) }));
  },

  deletePosting: async (id) => {
    await jobService.remove(id);
    set({ postings: get().postings.filter((posting) => posting.id !== id) });
  },
}));

onSessionEnd(() => useJobStore.setState(initialState));
