import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// --- Types from CourseModal --- //

// These types should ideally be defined in a central types file (e.g., `src/types/course.ts`)
// and imported here and in `CourseModal.tsx` to avoid duplication and ensure consistency.

interface LessonForm {
  id?: number;
  temp_id?: string; 
  title: string;
  order: number;
  durationMinutes: number;
  contentType: 'video' | 'quiz' | 'text';
  isFinalQuiz?: boolean;
  video_url?: string;
  video_source?: 'url' | 'upload';
  uploaded_video_file?: File | null;
  lesson_text?: string;
  quiz_id?: number | null;
}

interface ModuleForm {
  id?: number;
  title: string;
  order: number;
  lessons: LessonForm[];
}

interface FormValues {
  title: string;
  subtitle: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "allLevel";
  categoryId: number;
  isPublished?: boolean;
  whatYouWillLearn: string[];
  requirements: string[];
  thumbnailUrl?: string;
  introVideoUrl?: string;
}

export interface ApiCourseResponse {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string;
  difficulty: string;
  total_duration: number;
  is_published: boolean;
  created_at: string;
  instructor_id: number;
  category_id: number;
  description: string;
  intro_video_url?: string;
  what_you_will_learn?: string[];
  course_requirements?: string[];
  modules?: {
    id: number;
    title: string;
    order_position: number;
    lessons: {
      id?: number;
      title: string;
      content_type: 'video' | 'text' | 'quiz';
      video_url?: string;
      lesson_text?: string;
      quiz_id?: number | null;
      duration: number;
      order_position: number;
      is_final_quiz?: boolean;
    }[];
  }[];
  user: {
    id: number;
    full_name: string;
  };
  categorieName: string;
  enrollmentsCount: number;
  subtitle?: string;
}

// --- Zustand Store Definition --- //

export interface CourseModalState {
  // Form Data
  formValues: FormValues;
  modules: ModuleForm[];

  // UI State
  activeStep: number;
  isSubmitting: boolean;
  isModalOpen: boolean;
  courseId: number | null; // To distinguish between create and update

  // File previews and sources
  thumbnailPreview: string;
  introVideoSource: 'url' | 'upload';

  // Module & Lesson Editing State
  currentModule: ModuleForm;
  editingModuleIndex: number | null;
  showModuleForm: boolean;

  currentLesson: LessonForm;
  editingLessonIndex: number | null;
  showLessonForm: boolean;
}

interface CourseModalActions {
  // General Actions
  initializeState: (course?: ApiCourseResponse) => void;
  restoreFromDraft: (draft: Partial<CourseModalState>) => void;
  resetState: () => void;
  setModalOpen: (isOpen: boolean, course?: ApiCourseResponse) => void;
  setCourseId: (id: number | null) => void;

  // Form Value Actions
  setFormValue: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  setAllFormValues: (values: FormValues) => void;

  // UI State Actions
  setActiveStep: (step: number) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;

  // File Actions
  setThumbnailPreview: (preview: string) => void;
  setIntroVideoSource: (source: 'url' | 'upload') => void;

  // Module Actions
  setModules: (modules: ModuleForm[]) => void;
  addModule: (module: ModuleForm) => void;
  updateModule: (index: number, module: ModuleForm) => void;
  deleteModule: (index: number) => void;
  setCurrentModule: (module: ModuleForm) => void;
  setEditingModuleIndex: (index: number | null) => void;
  setShowModuleForm: (show: boolean) => void;

  // Lesson Actions
  addLesson: (moduleIndex: number, lesson: LessonForm) => void;
  updateLesson: (moduleIndex: number, lessonIndex: number, lesson: LessonForm) => void;
  deleteLesson: (moduleIndex: number, lessonIndex: number) => void;
  setCurrentLesson: (lesson: LessonForm) => void;
  setEditingLessonIndex: (index: number | null) => void;
  setShowLessonForm: (show: boolean) => void;
}

const getDraftKey = (courseId?: number | null) => `course-draft-${courseId || 'new'}`;

const initialState: CourseModalState = {
  formValues: {
    title: "",
    subtitle: "",
    description: "",
    difficulty: "beginner",
    categoryId: 0,
    isPublished: false,
    whatYouWillLearn: [],
    requirements: [],
    thumbnailUrl: "",
    introVideoUrl: "",
  },
  modules: [],
  activeStep: 0,
  isSubmitting: false,
  isModalOpen: false,
  courseId: null,
  thumbnailPreview: "",
  introVideoSource: "url",
  currentModule: { title: "", order: 1, lessons: [] },
  editingModuleIndex: null,
  showModuleForm: false,
  currentLesson: { title: "", order: 1, durationMinutes: 1, contentType: "video" },
  editingLessonIndex: null,
  showLessonForm: false,
};

export const useCourseModalStore = create<CourseModalState & CourseModalActions>()(
  immer((set, get) => ({
    ...initialState,

    // --- ACTIONS --- //

 

    clearDraft: () => {
      const draftKey = getDraftKey(get().courseId);
      localStorage.removeItem(draftKey);
      console.log(`Draft ${draftKey} cleared.`);
    },
    setModalOpen: (isOpen, course) => {
      console.log('setModalOpen called:', { isOpen, course }); // Debug log
      set(state => {
        state.isModalOpen = isOpen;
        if (isOpen) {
          state.courseId = course?.id || null;
        }
        console.log('Modal state updated:', state.isModalOpen); // Debug log
      });
    },
    
    // 4. Alternative approach - use a separate action to force modal open
    forceModalOpen: (courseId?: number | null) => {
      set(state => {
        state.isModalOpen = true;
        state.courseId = courseId || null;
      });
    },
    restoreFromDraft: (draft) => {
      console.log('Restoring from draft:', draft);
      set(state => {
        // DON'T reset to initialState - this wipes out the data!
        // Object.assign(state, initialState); // ❌ Remove this line
        
        // Instead, carefully apply the draft data
        if (draft.formValues) {
          state.formValues = {
            title: draft.formValues.title || "",
            subtitle: draft.formValues.subtitle || "",
            description: draft.formValues.description || "",
            difficulty: draft.formValues.difficulty || "beginner",
            categoryId: draft.formValues.categoryId || 0,
            isPublished: draft.formValues.isPublished || false,
            whatYouWillLearn: draft.formValues.whatYouWillLearn || [],
            requirements: draft.formValues.requirements || [],
            thumbnailUrl: draft.formValues.thumbnailUrl || "",
            introVideoUrl: draft.formValues.introVideoUrl || "",
          };
        }
        
        if (draft.modules) {
          state.modules = [...draft.modules];
        }
        
        // Set other properties from draft
        if (draft.courseId !== undefined) {
          state.courseId = draft.courseId;
        }
        
        if (draft.activeStep !== undefined) {
          state.activeStep = draft.activeStep;
        }
        
        if (draft.introVideoSource) {
          state.introVideoSource = draft.introVideoSource;
        }
        
        if (draft.thumbnailPreview) {
          state.thumbnailPreview = draft.thumbnailPreview;
        }
        
        // Always ensure modal is open when restoring from draft
        state.isModalOpen = true;
        state.isSubmitting = false;
        
        console.log('State after restore - formValues:', state.formValues);
        console.log('State after restore - modules:', state.modules);
        console.log('State after restore - isModalOpen:', state.isModalOpen);
      });
    },

    initializeState: (course) => {
      if (course) {
        set({
          formValues: {
            title: course.title ?? "",
            subtitle: course.subtitle ?? "",
            description: course.description ?? "",
            difficulty: (course.difficulty as FormValues['difficulty']) ?? "beginner",
            categoryId: course.category_id ?? 0,
            isPublished: course.is_published ?? false,
            whatYouWillLearn: course.what_you_will_learn ?? [],
            requirements: course.course_requirements ?? [],
            thumbnailUrl: course.thumbnail_url ?? "",
            introVideoUrl: !course.intro_video_url?.includes("/uploads") ? course.intro_video_url ?? "" : "",
          },
          modules: course.modules?.map((mod: any) => ({
            id: mod.id,
            title: mod.title,
            order: mod.order_position,
            lessons: mod.lessons.map((lesson: any) => ({
              id: lesson.id,
              title: lesson.title,
              order: lesson.order_position,
              durationMinutes: lesson.duration / 60,
              contentType: lesson.content_type,
              video_url: lesson.video_url,
              lesson_text: lesson.lesson_text,
              quiz_id: lesson.quiz_id,
              isFinalQuiz: lesson.is_final_quiz,
            }))
          })) || [],
          thumbnailPreview: course.thumbnail_url ? `${process.env.NEXT_PUBLIC_API_URL}${course.thumbnail_url}` : "",
          introVideoSource: course.intro_video_url?.includes('/uploads') ? "upload" : "url",
        });
      } else {
        get().resetState();
      }
    },

    resetState: () => set(initialState),

    setCourseId: (id) => set({ courseId: id }),

    setFormValue: (key, value) => set(state => { state.formValues[key] = value; }),
    setAllFormValues: (values) => set({ formValues: values }),

    setActiveStep: (step) => set({ activeStep: step }),
    setIsSubmitting: (isSubmitting) => set({ isSubmitting: isSubmitting }),

    setThumbnailPreview: (preview) => set({ thumbnailPreview: preview }),
    setIntroVideoSource: (source) => set({ introVideoSource: source }),

    setModules: (modules) => set({ modules: modules }),
    addModule: (module) => set(state => { state.modules.push(module); }),
    updateModule: (index, module) => set(state => { state.modules[index] = module; }),
    deleteModule: (index) => set(state => { state.modules.splice(index, 1); }),

    setCurrentModule: (module) => set({ currentModule: module }),
    setEditingModuleIndex: (index) => set({ editingModuleIndex: index }),
    setShowModuleForm: (show) => set({ showModuleForm: show }),

    addLesson: (moduleIndex, lesson) => set(state => { state.modules[moduleIndex].lessons.push(lesson); }),
    updateLesson: (moduleIndex, lessonIndex, lesson) => set(state => { state.modules[moduleIndex].lessons[lessonIndex] = lesson; }),
    deleteLesson: (moduleIndex, lessonIndex) => set(state => { state.modules[moduleIndex].lessons.splice(lessonIndex, 1); }),

    setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
    setEditingLessonIndex: (index) => set({ editingLessonIndex: index }),
    setShowLessonForm: (show) => set({ showLessonForm: show }),

  }))
);
