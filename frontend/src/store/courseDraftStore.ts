import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// The shape of the data saved for a single draft
export interface CourseDraft {
  formValues: any; // Ideally, replace 'any' with the actual form values type
  modules: any[]; // Ideally, replace 'any' with the actual module type
  thumbnailFile: File | null;
  slug: string | null;
  introVideoFile: File | null;
  instructor_id: number;
  introVideoSource: string;
  courseId: number | null;
  needsSubmission?: boolean; // Flag to indicate if the draft should be sent to the API
}

// The state of the store
export interface CourseDraftState {
  drafts: Record<string, CourseDraft>; // Key: courseId as string or 'new'
  isProcessing: Record<string, boolean>; // Tracks processing status per draft
}

// The actions available on the store
export interface CourseDraftActions {
  commitDraft: (draft: CourseDraft, options?: { submit: boolean }) => void;
  getDraft: (key: string) => CourseDraft | null;
  clearDraft: (courseId: number | null) => void;
  setProcessing: (courseId: number | null, processing: boolean) => void;
}

// The initial state when the app loads
const initialState: CourseDraftState = {
  drafts: {},
  isProcessing: {},
};

// Helper to get the key for a draft based on its courseId
const getDraftKey = (courseId: number | null): string => {
  return courseId?.toString() ?? 'new';
};

export const useCourseDraftStore = create<CourseDraftState & CourseDraftActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      commitDraft: (draft, options) => {
        const key = getDraftKey(draft.courseId);
        set((state) => {
          const newDraft = { ...draft, needsSubmission: options?.submit ?? false };
          state.drafts[key] = newDraft;
          state.isProcessing[key] = false; // Reset processing status on new commit
        });
      },

      getDraft: (key: string) => {
        return get().drafts[key] ?? null;
      },

      clearDraft: (courseId: number | null) => {
        const key = getDraftKey(courseId);
        set((state) => {
          delete state.drafts[key];
          delete state.isProcessing[key];
        });
      },

      setProcessing: (courseId: number | null, processing: boolean) => {
        const key = getDraftKey(courseId);
        set((state) => {
          state.isProcessing[key] = processing;
        });
      },
    })),
    {
      name: 'course-draft-storage', // unique name in localStorage
      storage: createJSONStorage(() => localStorage, {
        // Custom replacer to handle non-serializable File objects.
        // This prevents errors during JSON serialization for localStorage.
        replacer: (key, value) => {
          if (value instanceof File) {
            return null; // Storing Files in localStorage is not possible, so we store null instead.
          }
          return value;
        },
      }),
    }
  )
);
