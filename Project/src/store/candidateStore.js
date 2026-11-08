import { create } from 'zustand';
import { candidateService } from '../services/candidateService';
import { onSessionEnd, runLoad } from './sessionReset';

const initialState = { profile: null, loading: {}, errors: {} };

export const useCandidateStore = create((set) => {
  // Every profile mutation returns the updated profile from the API.
  const save = async (request) => {
    const profile = await request();
    set({ profile });
    return profile;
  };

  return {
    ...initialState,

    fetchProfile: () => runLoad(set, 'profile', candidateService.getProfile, (profile) => ({ profile })),

    updateProfile: (changes) => save(() => candidateService.updateProfile(changes)),
    addItem: (section, item) => save(() => candidateService.addItem(section, item)),
    updateItem: (section, id, item) => save(() => candidateService.updateItem(section, id, item)),
    removeItem: (section, id) => save(() => candidateService.removeItem(section, id)),
    addSkill: (skill) => save(() => candidateService.addSkill(skill)),
    removeSkill: (name) => save(() => candidateService.removeSkill(name)),
    uploadResume: (file) => save(() => candidateService.uploadResume(file)),
    removeResume: () => save(() => candidateService.removeResume()),
  };
});

onSessionEnd(() => useCandidateStore.setState(initialState));
