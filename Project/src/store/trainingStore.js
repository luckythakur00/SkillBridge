import { create } from 'zustand';
import { trainingService } from '../services/trainingService';
import { onSessionEnd, runLoad } from './sessionReset';

const initialState = { programs: [], enrollments: [], managed: [], loading: {}, errors: {} };

const replaceById = (list, item) => list.map((entry) => (entry.id === item.id ? item : entry));

export const useTrainingStore = create((set) => ({
  ...initialState,

  fetchPrograms: (params) => runLoad(set, 'programs', () => trainingService.list(params), (programs) => ({ programs })),
  fetchEnrollments: () => runLoad(set, 'enrollments', trainingService.enrollments, (enrollments) => ({ enrollments })),

  enroll: async (programId) => {
    const enrollment = await trainingService.enroll(programId);
    set((state) => ({
      enrollments: [...state.enrollments, enrollment],
      programs: replaceById(state.programs, enrollment.program),
    }));
  },

  unenroll: async (program) => {
    await trainingService.unenroll(program.id);
    set((state) => ({
      enrollments: state.enrollments.filter((entry) => entry.programId !== program.id),
      programs: state.programs.map((entry) =>
        entry.id === program.id
          ? { ...entry, isEnrolled: false, enrolledCount: entry.enrolledCount - 1, seatsLeft: entry.seatsLeft + 1 }
          : entry,
      ),
    }));
  },

  // Recruiter-managed programs
  fetchManaged: () => runLoad(set, 'managed', trainingService.mine, (managed) => ({ managed })),

  createProgram: async (payload) => {
    const program = await trainingService.create(payload);
    set((state) => ({ managed: [program, ...state.managed] }));
  },

  updateProgram: async (id, payload) => {
    const program = await trainingService.update(id, payload);
    set((state) => ({ managed: replaceById(state.managed, program) }));
  },

  deleteProgram: async (id) => {
    await trainingService.remove(id);
    set((state) => ({ managed: state.managed.filter((entry) => entry.id !== id) }));
  },

  fetchEnrollees: (id) => trainingService.enrollees(id),
}));

onSessionEnd(() => useTrainingStore.setState(initialState));
