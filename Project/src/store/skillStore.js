import { create } from 'zustand';
import { skillService } from '../services/skillService';
import { onSessionEnd, runLoad } from './sessionReset';

const initialState = {
  catalog: [],
  mapping: null,
  assessments: [],
  results: [],
  activeAssessment: null,
  loading: {},
  errors: {},
};

export const useSkillStore = create((set, get) => ({
  ...initialState,

  fetchCatalog: () => {
    if (get().catalog.length) return Promise.resolve(get().catalog);
    return runLoad(set, 'catalog', skillService.catalog, (catalog) => ({ catalog }));
  },

  fetchMapping: () => runLoad(set, 'mapping', skillService.skillMapping, (mapping) => ({ mapping })),
  fetchAssessments: () => runLoad(set, 'assessments', skillService.assessments, (assessments) => ({ assessments })),
  fetchResults: () => runLoad(set, 'results', skillService.results, (results) => ({ results })),

  startAssessment: (id) => {
    set({ activeAssessment: null });
    return runLoad(set, 'activeAssessment', () => skillService.assessment(id), (activeAssessment) => ({ activeAssessment }));
  },

  submitAssessment: async (id, answers) => {
    const result = await skillService.submitAssessment(id, answers);
    set((state) => ({ results: [result, ...state.results] }));
    return result;
  },
}));

onSessionEnd(() => useSkillStore.setState({ ...initialState, catalog: useSkillStore.getState().catalog }));
