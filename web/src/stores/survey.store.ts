import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SurveyAnswer {
  questionId: string;
  value: unknown;
}

export interface DraftResponse {
  localId: string;
  formId: string;
  campaignId: string;
  answers: Record<string, unknown>;
  lat?: number;
  lng?: number;
  startedAt: string;
}

interface SurveyState {
  activeFormId: string | null;
  activeCampaignId: string | null;
  draft: DraftResponse | null;
  currentSectionIndex: number;
  setActiveForm: (formId: string, campaignId: string) => void;
  setDraft: (draft: DraftResponse | null) => void;
  updateAnswer: (questionId: string, value: unknown) => void;
  setSection: (index: number) => void;
  resetSurvey: () => void;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      activeFormId: null,
      activeCampaignId: null,
      draft: null,
      currentSectionIndex: 0,
      setActiveForm: (formId, campaignId) =>
        set({ activeFormId: formId, activeCampaignId: campaignId }),
      setDraft: (draft) => set({ draft }),
      updateAnswer: (questionId, value) => {
        const { draft } = get();
        if (!draft) return;
        set({
          draft: {
            ...draft,
            answers: { ...draft.answers, [questionId]: value },
          },
        });
      },
      setSection: (index) => set({ currentSectionIndex: index }),
      resetSurvey: () =>
        set({
          activeFormId: null,
          activeCampaignId: null,
          draft: null,
          currentSectionIndex: 0,
        }),
    }),
    {
      name: 'poliintel-survey',
    },
  ),
);
