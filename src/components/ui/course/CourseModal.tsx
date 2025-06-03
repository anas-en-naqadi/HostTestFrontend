"use client";

import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Step, FormControl, InputLabel, StepLabel, Select, MenuItem, FormHelperText, Button, IconButton, Chip, Grid, Stepper, StepIcon, CircularProgress, Radio, RadioGroup } from "@mui/material";
import { Loader2, X, Plus, Upload, PlusCircle } from "lucide-react";
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";
import { useCreateCourse } from "@/lib/hooks/course-management";
import { useUpdateCourse, useUpdateCourseJson } from "@/lib/hooks/course-management";
import { useFetchCategories } from "@/lib/hooks/course-management";
import { useQuizzes } from "@/lib/hooks/useQuizzes";
import { ServerQuiz } from "@/lib/api/quizzes";
import { alertConfirm, alertSuccess } from "@/utils/alert";
import { toast } from "sonner";
import Check from '@mui/icons-material/Check';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import { useAuthStore } from "@/store/authStore";
import RichTextEditor from "@/components/features/RichInput";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
import Image from "next/image";

// Define interface for the API response structure based on the actual response
interface Category {
  id: number;
  name: string;
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface ApiCourseResponse {
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

interface CourseModalProps {
  open: boolean;
  onClose: () => void;
  course?: ApiCourseResponse;
  title: string;
}

const courseSchema = z.object({
  title: z.string().min(5, { message: "Course title must be at least 5 characters" }),
  subtitle: z.string().min(10, { message: "Subtitle must be at least 10 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "allLevel"]),
  categoryId: z.number({ required_error: "Category is required" }),

  isPublished: z.boolean().optional(),
  whatYouWillLearn: z.array(z.string()).min(1, { message: "Add at least one learning outcome" }),
  requirements: z.array(z.string()).min(1, { message: "Add at least one requirement" }),
  thumbnailUrl: z.string().optional(),
  introVideoUrl: z.string().optional().refine(
    (url) => !url || isValidVideoUrl(url),
    { message: "Intro video URL must be a valid YouTube URL or video file URL (.mp4, .webm, .ogg, .mov, .mkv)" }
  ),
});

type FormValues = z.infer<typeof courseSchema>;

// --- Step 2: Module & Lesson Management Types ---
interface LessonForm {
  id?: number;
  temp_id?: string; // Temporary ID for tracking new lessons during upload
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
  id?: number;  // Optional ID field for existing modules
  title: string;
  order: number;
  lessons: LessonForm[];
}

export function CourseModal({ open, onClose, course, title }: CourseModalProps) {
  const isNewCourse = !course;
  const { user } = useAuthStore();
  // Type assertion for user to ensure ID is accessible
  const currentUser = user as { id: number } | null;
  const [activeStep, setActiveStep] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);
  const [introVideoSource, setIntroVideoSource] = useState<"url" | "upload">("url");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createCourse } = useCreateCourse();
  const { mutateAsync: updateCourse } = useUpdateCourse();

  const { mutateAsync: updateCourseWithJson } = useUpdateCourseJson();
  // Fetch categories with proper typing
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useFetchCategories();

  // Fetch quizzes data and extract the array properly
  // Fetch and process quizzes data
  const { quizzes: quizzesData } = useQuizzes();

  // Process quizzes to ensure proper structure and type safety
  const quizzes = React.useMemo(() => {
    if (!quizzesData) return [];
    return quizzesData.map((quiz: ServerQuiz) => ({
      ...quiz,
      // Ensure isFinal is always a boolean
      isFinal: Boolean(quiz.isFinal)
    }));
  }, [quizzesData]);


  // Extract categories array safely - the API returns categories directly
  const categories = categoriesResponse?.data || [];


  const isValidVideoUrl = (url: string): boolean => {
    if (typeof url !== 'string' || !url.trim()) {
      return false;
    }

    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      // Not a valid URL
      return false;
    }

    // Only http(s) URLs
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Check for YouTube URLs
    const isYoutubeUrl = (
      parsed.hostname.includes('youtube.com') || 
      parsed.hostname.includes('youtu.be') ||
      parsed.hostname.includes('youtube-nocookie.com')
    );
    
    if (isYoutubeUrl) {
      return true;
    }

    // Allowed video file extensions for direct video files
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.mkv'];
    const path = parsed.pathname.toLowerCase();

    return videoExts.some(ext => path.endsWith(ext));
  };




  // Calculate total duration of a module
  const getModuleTotalDuration = (mod: ModuleForm) => {
    return mod.lessons.reduce((total, lesson) => total + lesson.durationMinutes, 0);
  };

  // Function to check if there's already a final quiz in any module
  const hasFinalQuiz = (excludeLessonIndex: number | null = null) => {
    // Check current module first (excluding the lesson being edited if applicable)
    const currentModuleHasFinalQuiz = currentModule.lessons.some((lesson, idx) =>
      idx !== excludeLessonIndex &&
      lesson.contentType === 'quiz' &&
      ensureBoolean(lesson.isFinalQuiz)
    );

    if (currentModuleHasFinalQuiz) {
      return true;
    }

    // Then check all other modules
    return modules.some(module =>
      module.lessons.some(lesson =>
        lesson.contentType === 'quiz' &&
        ensureBoolean(lesson.isFinalQuiz)
      )
    );
  };

  // Module and lesson management functions
  const handleAddNewModule = () => {
    // Calculer le nombre total de modules, y compris ceux qui viennent d'être ajoutés
    // mais pas encore sauvegardés
    const totalModules = modules.length;

    // Calculer le prochain ordre, en s'assurant qu'il est au moins 1
    const nextModuleOrder = Math.max(1, totalModules + 1);

    // Réinitialiser le formulaire du module avec les valeurs par défaut et la position d'ordre correcte
    setCurrentModule({
      title: '',
      order: nextModuleOrder,
      lessons: []
    });

    // Afficher le formulaire du module
    setShowModuleForm(true);
    setEditingModuleIndex(null);
    setModuleError(null); // Effacer les erreurs précédentes

    // Log pour le débogage
    console.log(`Setting new module order to: ${nextModuleOrder} (total modules: ${totalModules})`);
  };
  
  const handleAddOrUpdateLesson = () => {
    // Validate lesson data
    if (!currentLesson.title.trim()) { setLessonError('Lesson title is required.'); return; }
    // Ensure order is always at least 1
    const lessonOrder = currentLesson.order < 1 ? 1 : currentLesson.order;
    // Update the lesson with the corrected order
    setCurrentLesson(prev => ({ ...prev, order: lessonOrder }));
    if (!currentLesson.durationMinutes || currentLesson.durationMinutes < 1) { setLessonError('Duration must be ≥ 1 minute.'); return; }
    if (!currentLesson.contentType) { setLessonError('Content type is required.'); return; }

    // Validate content based on type
    if (currentLesson.contentType === 'text' && currentLesson.lesson_text === "<p><br></p>") {
      toast.error('Please enter the lesson text content');
      return;
    }
    if (currentLesson.contentType === 'video') {
    // Check based on video source (URL or upload)
    if (currentLesson.video_source === 'upload') {
      // For upload option, validation depends on whether we're editing a lesson with an existing video
      const hasExistingUploadedVideo = editingLessonIndex !== null && 
                                      currentModule.lessons[editingLessonIndex]?.video_url?.includes('/uploads');
      
      // Only require a new upload if there's no existing video
      if (!hasExistingUploadedVideo && !currentLesson.uploaded_video_file) {
        setLessonError('Please upload a video file or switch to URL option');
        return;
      }
      setLessonError(null); // Clear any previous errors
    } else {
      console.log(currentLesson);
      // URL validation - only validate URL when URL option is selected
      if (currentLesson.video_source === 'url' && !currentLesson.video_url) {
        console.log("i am here 0")
        setLessonError('Video URL is required for video lessons.');
        return;
      }
      if (currentLesson.video_source === 'url' && !isValidVideoUrl(currentLesson.video_url)) {
        console.log("i am here 1");
        setLessonError('Please enter a valid video URL. Supported formats: YouTube links or video files (.mp4, .webm, .ogg, .mov, .mkv).');
        return;
      }
      setLessonError(null); // Clear any previous errors
    }
  }
    if (currentLesson.contentType === 'text' && !currentLesson.lesson_text) { setLessonError('Content is required for text lessons.'); return; }
    if (currentLesson.contentType === 'quiz' && !currentLesson.quiz_id) { setLessonError('Please select a quiz.'); return; }

    // Only check for duplicate final quizzes when adding a new lesson or changing a non-final quiz to final
    // If we're editing an existing lesson that was already a final quiz, we don't need this check
    if (currentLesson.contentType === 'quiz' && ensureBoolean(currentLesson.isFinalQuiz)) {
      // For new lessons or when changing a non-final quiz to final
      if (editingLessonIndex === null ||
        (editingLessonIndex !== null &&
          !ensureBoolean(currentModule.lessons[editingLessonIndex]?.isFinalQuiz))) {

        // Check if there's already a final quiz elsewhere
        if (hasFinalQuiz(editingLessonIndex)) {
          setLessonError('A course can only have one final quiz. Another module already contains a final quiz.');
          return;
        }
      }
    }

    // Update or add the lesson
    if (editingLessonIndex !== null) {
      // Update existing lesson
      setCurrentModule(mod => {
        const updatedLessons = [...mod.lessons];
        updatedLessons[editingLessonIndex] = currentLesson;

        // Sort lessons by order
        updatedLessons.sort((a, b) => a.order - b.order);

        // Reassign order positions to ensure they are sequential (1, 2, 3, ...)
        const reorderedLessons = updatedLessons.map((lesson, index) => ({
          ...lesson,
          order: index + 1
        }));

        return { ...mod, lessons: reorderedLessons };
      });
      setEditingLessonIndex(null);
    } else {
      // Add new lesson with a temporary ID for tracking file uploads
      const tempId = `new_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      setCurrentModule(mod => {
        const updatedLessons = [...mod.lessons, {
          ...currentLesson,
          temp_id: tempId // Add temporary ID for new lessons
        }];

        // Sort lessons by order
        updatedLessons.sort((a, b) => a.order - b.order);

        // Reassign order positions to ensure they are sequential (1, 2, 3, ...)
        const reorderedLessons = updatedLessons.map((lesson, index) => ({
          ...lesson,
          order: index + 1
        }));

        return { ...mod, lessons: reorderedLessons };
      });
    }

    // Don't update the modules array yet if we're working with a new module that hasn't been saved
    // This prevents the module from being added to the list prematurely
    if (editingModuleIndex !== null && editingModuleIndex >= 0) {
      setModules(prevModules => {
        // Replace the edited module
        return prevModules.map((mod, idx) => idx === editingModuleIndex ? { ...currentModule } : mod);
      });
    }
    // If working with a new module, don't add it to modules array yet - it will be added when handleValidateModule is called

    // Reset form
    setCurrentLesson({
      title: '',
      // Always set the next order as currentModule.lessons.length + 1
      order: currentModule.lessons.length + 1,
      durationMinutes: 1,
      contentType: 'video',
      isFinalQuiz: false,
      video_url: '',
      video_source: 'url',
      uploaded_video_file: null,
      lesson_text: '',
      quiz_id: null
    });
    setShowLessonForm(false);
    setLessonError(null); // Clear any previous errors
  };

  const handleDeleteLesson = async (idx: number) => {
    // Hide the lesson form
    setShowLessonForm(false);

    // Show confirmation dialog
    setIsConfirmDialogOpen(true);
    try {
      const ok = await alertConfirm('Delete Lesson?', 'Are you sure you want to delete this lesson?');

      if (ok) {
        // Reset current lesson form to default state
        setCurrentLesson({
          title: '',
          order: currentModule.lessons.length, // Set to next available position
          durationMinutes: 1,
          contentType: 'video',
          isFinalQuiz: false,
          video_url: '',
          lesson_text: '',
          quiz_id: null
        });

        // Remove the lesson from the module
        setCurrentModule(prev => {
          // Filter out the deleted lesson
          const updatedLessons = prev.lessons.filter((_, i) => i !== idx);

          // Re-number remaining lessons to ensure sequential order (1, 2, 3...)
          const reorderedLessons = updatedLessons.map((lesson, index) => ({
            ...lesson,
            order: index + 1 // Always start from 1
          }));

          return {
            ...prev,
            lessons: reorderedLessons
          };
        });

        // If we're editing an existing module, update it in the modules array too
        if (editingModuleIndex !== null && editingModuleIndex >= 0) {
          setModules(prevModules => {
            const updatedModules = [...prevModules];
            updatedModules[editingModuleIndex] = {
              ...currentModule,
              lessons: currentModule.lessons.filter((_, i) => i !== idx).map((lesson, index) => ({
                ...lesson,
                order: index + 1
              }))
            };
            return updatedModules;
          });
        }
      }
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const handleEditLesson = (idx: number) => {
    const lesson = currentModule.lessons[idx];
    console.log("current edit lesson", lesson)
    if(isNewCourse)  setCurrentLesson({ ...lesson, video_source: lesson.uploaded_video_file ? 'upload' : 'url' });
   else setCurrentLesson({ ...lesson, video_source: lesson.video_url?.includes('/uploads') ? 'upload' : 'url',video_url: lesson.video_url?.includes('/uploads') ? '' : lesson.video_url, uploaded_video_file: null });
    setEditingLessonIndex(idx);
    setShowLessonForm(true);
    setLessonError(null); // Clear any previous errors
  };


  const handleValidateModule = () => {
    // Validate module data
    if (!currentModule.title.trim()) { setModuleError('Module title is required.'); return; }

    // Ensure order is always at least 1
    const moduleOrder = currentModule.order < 1 ? 1 : currentModule.order;
    // Update the module with the corrected order
    setCurrentModule(prev => ({ ...prev, order: moduleOrder }));

    if (currentModule.lessons.length < 1) { setModuleError('At least one lesson is required.'); return; }

    // Ensure lessons have sequential order numbers (1, 2, 3...)
    // First sort them by their current order
    const sortedLessons = [...currentModule.lessons].sort((a, b) => a.order - b.order);

    // Then reassign order values starting from 1
    const reorderedLessons = sortedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1 // This ensures lessons are always numbered 1, 2, 3...
    }));

    // Update currentModule with properly ordered lessons
    setCurrentModule(prevModule => ({
      ...prevModule,
      lessons: reorderedLessons
    }));

    // Check for duplicate order positions in lessons
    const lessonOrders = currentModule.lessons.map(lesson => lesson.order);
    const uniqueOrders = new Set(lessonOrders);

    if (uniqueOrders.size !== lessonOrders.length) {
      setModuleError('Each lesson must have a unique order position within the module.');
      return;
    }

    // Check if this module contains a final quiz and if there's already one in other modules
    const moduleHasFinalQuiz = currentModule.lessons.some(lesson =>
      lesson.contentType === 'quiz' && ensureBoolean(lesson.isFinalQuiz)
    );

    if (moduleHasFinalQuiz) {
      // Check if any existing module (excluding the one being edited) has a final quiz
      const otherModulesHaveFinalQuiz = modules.some((mod, idx) =>
        idx !== editingModuleIndex &&
        mod.lessons.some(lesson =>
          lesson.contentType === 'quiz' && ensureBoolean(lesson.isFinalQuiz)
        )
      );

      if (otherModulesHaveFinalQuiz) {
        setModuleError('A course can only have one final quiz. Another module already contains a final quiz.');
        return;
      }
    }

    // Check if lesson orders are sequential (1, 2, 3, etc.)
    const sortedOrders = [...lessonOrders].sort((a, b) => a - b);
    const expectedSequence = Array.from({ length: sortedOrders.length }, (_, i) => i + 1);
    const isSequential = sortedOrders.every((order, index) => order === expectedSequence[index]);

    if (!isSequential) {
      setModuleError(`Lesson order positions must be sequential (1, 2, 3, etc.). Current orders: ${sortedOrders.join(', ')}`);
      return;
    }

    // Check for duplicate module order positions
    const isDuplicateModuleOrder = editingModuleIndex === null &&
      modules.some(module => module.order === currentModule.order);

    if (isDuplicateModuleOrder) {
      setModuleError(`A module with order position ${currentModule.order} already exists. Please choose a different order.`);
      return;
    }

    // Handle editing or adding new module
    if (editingModuleIndex !== null) {
      // Update existing module
      setModules(prev => {
        const updated = [...prev];
        updated[editingModuleIndex] = currentModule;
        // Sort modules by order
        return updated.sort((a, b) => a.order - b.order);
      });
      setEditingModuleIndex(null);
    } else {
      // Add new module
      setModules((prev) => {
        // Calculate the correct order for the new module - always next available number
        const newModuleOrder = editingModuleIndex === null ? prev.length + 1 : currentModule.order;

        // Create a new module with the correct order and properly ordered lessons
        const newModule = {
          ...currentModule,
          order: newModuleOrder,
          // Always ensure lessons are numbered 1, 2, 3...
          lessons: currentModule.lessons.map((lesson, idx) => ({
            ...lesson,
            order: idx + 1 // First lesson has order 1, second has order 2, etc.
          }))
        };

        const updated = [...prev, newModule];
        // Sort modules by order
        return updated.sort((a, b) => a.order - b.order);
      });
    }

    // Reset form
    setShowModuleForm(false);
    setCurrentModule({ title: '', order: modules.length + 1, lessons: [] });
    setModuleError(null);

    // Reset lesson form values as well
    setCurrentLesson({
      title: '',
      order: 1,
      durationMinutes: 1,
      contentType: 'video',
      isFinalQuiz: false,
      video_url: '',
      lesson_text: '',
      quiz_id: null
    });
    setShowLessonForm(false);
    setLessonError(null);
  };

  const handleEditModule = (idx: number) => {
    const module = modules[idx];
    setCurrentModule({ ...module });
    setEditingModuleIndex(idx);
    setShowModuleForm(true);
  };

  const handleDeleteModule = async (idx: number) => {
    // Hide the module form
    setShowModuleForm(false);

    // Show confirmation dialog
    setIsConfirmDialogOpen(true);

    try {
      const ok = await alertConfirm("Confirm Delete?", 'Are you sure you want to delete this module and all its lessons?');

      if (ok) {
        // Reset current module form to default state
        const nextModuleOrder = modules.length > 0 ? modules.length : 1;
        setCurrentModule({
          title: '',
          order: nextModuleOrder,
          lessons: []
        });

        setModules(prev => {
          // Filter out the deleted module
          const filteredModules = prev.filter((_, i) => i !== idx);

          // Reorder remaining modules to ensure sequential order starting from 1
          return filteredModules.map((module, index) => ({
            ...module,
            order: index + 1 // Always ensure modules are numbered 1, 2, 3...
          }));
        });
      }
    } finally {
      // Show the main modal again regardless of the user's choice
      setIsConfirmDialogOpen(false);
    }
  };

  // Handle module move up
  const handleModuleMoveUp = (index: number) => {
    if (index <= 0) return; // Already at the top

    setModules(prevModules => {
      const newModules = [...prevModules];
      // Swap with previous module
      [newModules[index], newModules[index - 1]] = [newModules[index - 1], newModules[index]];

      // Update order for all modules
      const updatedModules = newModules.map((module, idx) => ({
        ...module,
        order: idx + 1
      }));

      // If we're currently editing this module, update the currentModule state too
      if (editingModuleIndex === index) {
        setCurrentModule({ ...updatedModules[index - 1] });
        setEditingModuleIndex(index - 1);
      } else if (editingModuleIndex === index - 1) {
        setCurrentModule({ ...updatedModules[index] });
        setEditingModuleIndex(index);
      }
      return updatedModules;
    });
  };

  // Handle module move down
  const handleModuleMoveDown = (index: number) => {
    setModules(prevModules => {
      if (index >= prevModules.length - 1) return prevModules; // Already at the bottom

      const newModules = [...prevModules];
      // Swap with next module
      [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];

      // Update order for all modules
      const updatedModules = newModules.map((module, idx) => ({
        ...module,
        order: idx + 1
      }));

      // If we're currently editing this module, update the currentModule state too
      if (editingModuleIndex === index) {
        setCurrentModule({ ...updatedModules[index + 1] });
        setEditingModuleIndex(index + 1);
      } else if (editingModuleIndex === index + 1) {
        setCurrentModule({ ...updatedModules[index] });
        setEditingModuleIndex(index);
      }
      return updatedModules;
    });
  };

  // Handle lesson move up
  const handleLessonMoveUp = (lessonIndex: number) => {
    if (lessonIndex <= 0) return; // Already at the top

    setCurrentModule(prevModule => {
      const newLessons = [...prevModule.lessons];
      // Swap with previous lesson
      [newLessons[lessonIndex], newLessons[lessonIndex - 1]] = [newLessons[lessonIndex - 1], newLessons[lessonIndex]];

      // Update order for all lessons
      const updatedLessons = newLessons.map((lesson, idx) => ({
        ...lesson,
        order: idx + 1
      }));


      // If we're currently editing this module, update the currentModule state too
      if (editingLessonIndex === lessonIndex) {
        setCurrentLesson({ ...updatedLessons[lessonIndex - 1] });
        setEditingLessonIndex(lessonIndex - 1);
      } else if (editingLessonIndex === lessonIndex - 1) {
        setCurrentLesson({ ...updatedLessons[lessonIndex] });
        setEditingLessonIndex(lessonIndex);
      }
      return {
        ...prevModule,
        lessons: updatedLessons
      };
    });

    // If we're editing an existing module, update it in the modules array too
    if (editingModuleIndex !== null && editingModuleIndex >= 0) {
      setModules(prevModules => {
        const updatedModules = [...prevModules];
        updatedModules[editingModuleIndex] = currentModule;
        return updatedModules;
      });
    }
  };

  // Handle lesson move down
  const handleLessonMoveDown = (lessonIndex: number) => {
    setCurrentModule(prevModule => {
      if (lessonIndex >= prevModule.lessons.length - 1) return prevModule; // Already at the bottom

      const newLessons = [...prevModule.lessons];
      // Swap with next lesson
      [newLessons[lessonIndex], newLessons[lessonIndex + 1]] = [newLessons[lessonIndex + 1], newLessons[lessonIndex]];

      // Update order for all lessons
      const updatedLessons = newLessons.map((lesson, idx) => ({
        ...lesson,
        order: idx + 1
      }));
      // If we're currently editing this lesson, update the currentLesson state too
      if (editingLessonIndex === lessonIndex) {
        // We're editing the lesson that's moving down, update its index
        setCurrentLesson({ ...updatedLessons[lessonIndex + 1] });
        setEditingLessonIndex(lessonIndex + 1);
      } else if (editingLessonIndex === lessonIndex + 1) {
        // We're editing the lesson below, which is now moving up
        setCurrentLesson({ ...updatedLessons[lessonIndex] });
        setEditingLessonIndex(lessonIndex);
      }
      return {
        ...prevModule,
        lessons: updatedLessons
      };
    });

    // If we're editing an existing module, update it in the modules array too
    if (editingModuleIndex !== null && editingModuleIndex >= 0) {
      setModules(prevModules => {
        const updatedModules = [...prevModules];
        updatedModules[editingModuleIndex] = currentModule;
        return updatedModules;
      });
    }
  };

  // Module Item component
  const ModuleItem = ({ module, index }: { module: ModuleForm, index: number }) => {
    return (
      <Card sx={{ mb: 1, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1">{module.title}</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {getModuleTotalDuration(module)} min | {module.lessons.length} Lessons | Order: {module.order}
            </Typography>
            <IconButton
              onClick={() => handleModuleMoveUp(index)}
              size="small"
              sx={{ mr: 1 }}
              disabled={index === 0}
            >
              <Typography variant="caption">↑</Typography>
            </IconButton>
            <IconButton
              onClick={() => handleModuleMoveDown(index)}
              size="small"
              sx={{ mr: 1 }}
              disabled={index === modules.length - 1}
            >
              <Typography variant="caption">↓</Typography>
            </IconButton>
            <IconButton onClick={() => handleEditModule(index)} size="small" sx={{ mr: 1 }}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton onClick={() => handleDeleteModule(index)} sx={{ color: 'red' }} size="small">
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Card>
    );
  };

  // Lesson Item component
  const LessonItem = ({ lesson, lessonIndex }: { lesson: LessonForm, lessonIndex: number }) => {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ border: '1px solid #eee', borderRadius: 1, p: 1, mb: 1 }}
      >
        <Box display="flex" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {lesson.durationMinutes} min • {lesson.contentType} • Order: {lesson.order}
          </Typography>
        </Box>
        <Typography variant="body1">{lesson.title}</Typography>
        <Box>
          <IconButton
            onClick={() => handleLessonMoveUp(lessonIndex)}
            size="small"
            sx={{ mr: 1 }}
            disabled={lessonIndex === 0}
          >
            <Typography variant="caption">↑</Typography>
          </IconButton>
          <IconButton
            onClick={() => handleLessonMoveDown(lessonIndex)}
            size="small"
            sx={{ mr: 1 }}
            disabled={lessonIndex === currentModule.lessons.length - 1}
          >
            <Typography variant="caption">↓</Typography>
          </IconButton>
          <IconButton onClick={() => handleEditLesson(lessonIndex)} size="small"><Edit fontSize="small" /></IconButton>
          <IconButton onClick={() => handleDeleteLesson(lessonIndex)} sx={{ color: 'red' }} size="small"><Delete fontSize="small" /></IconButton>
        </Box>
      </Box>
    );
  };
  const [modules, setModules] = useState<ModuleForm[]>([]);
  const [newLearningItem, setNewLearningItem] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [currentForm, setCurrentForm] = useState<"module" | "lesson" | null>(null);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [videoUrlFileError, setVideoUrlFileError] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Helper function to ensure boolean values remain boolean
  const ensureBoolean = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (value === '') return false;
    return Boolean(value);
  };

  const [currentLesson, setCurrentLesson] = useState<LessonForm>({
    title: "",
    order: 1, // Initialize with 1 instead of 0
    durationMinutes: 1, // Initialize with 1 instead of 0
    contentType: "video",
    video_url: "",
    lesson_text: "",
    quiz_id: null,
    isFinalQuiz: false
  });
  const [currentModule, setCurrentModule] = useState<ModuleForm>({
    title: "",
    order: 1, // Initialize with 1 instead of 0
    lessons: [],
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
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
  });

  useEffect(() => {
    if (open) {
      // Always reset to first step when modal opens
      setActiveStep(0);
      if (course) {
        console.log('Loading course data for editing:', course);

        // Set basic course details
        setValue("title", course.title ?? "");
        setValue("subtitle", course.subtitle ?? "");
        setValue("description", course.description ?? "");
        setIntroVideoSource(course.intro_video_url?.includes('uploads') ? "upload" : "url");

        // Clear any previously uploaded thumbnail file
        setThumbnailFile(null);

        // Set thumbnail preview if available
        if (course.thumbnail_url) {
          // Fix thumbnail preview path if it's a relative URL
          const thumbnailUrl = course.thumbnail_url.startsWith('http')
            ? course.thumbnail_url
            : `${process.env.NEXT_PUBLIC_API_URL}${course.thumbnail_url}`;
          setThumbnailPreview(thumbnailUrl);
          console.log('Setting thumbnail preview URL:', thumbnailUrl);
        }

        setValue("introVideoUrl", !course.intro_video_url?.includes("/uploads") ? course.intro_video_url ?? "" : "");
        setValue("difficulty", course.difficulty as "beginner" | "intermediate" | "advanced" | "allLevel");



        if (course.category_id) {
          console.log('Using direct category_id:', course.category_id);
          setValue("categoryId", course.category_id);
        } else if (course.categories?.id) {
          console.log('Using categories.id:', course.categories.id);
          setValue("categoryId", course.categories.id);
        } else if (course.categorieName && categories.length > 0) {
          const categoryId = categories.find((cat: Category) => cat.name === course.categorieName)?.id || 0;
          console.log('Fallback to finding by name:', categoryId);
          setValue("categoryId", categoryId);
        } else {
          console.log('No category information available');
          setValue("categoryId", 0);
        }
        setValue("isPublished", course.is_published);

        // Set learning outcomes and requirements if available
        if (course.what_you_will_learn && Array.isArray(course.what_you_will_learn)) {
          setValue("whatYouWillLearn", course.what_you_will_learn);
        }

        if (course.course_requirements && Array.isArray(course.course_requirements)) {
          setValue("requirements", course.course_requirements);
        }

        // Load modules and lessons if available
        if (course.modules && Array.isArray(course.modules)) {
          console.log('Loading modules and lessons:', course.modules);
          try {
            const formattedModules = course.modules.map(mod => ({
              id: mod.id,
              title: mod.title,
              order: mod.order_position,
              lessons: mod.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                order: lesson.order_position,
                durationMinutes: lesson.duration,
                contentType: lesson.content_type,
                video_url: lesson.video_url,
                lesson_text: lesson.lesson_text,
                quiz_id: lesson.quiz_id,
                // Properly handle final quiz status from various possible property names
                // Check multiple properties that might indicate a final quiz
                isFinalQuiz: Boolean(lesson.is_final_quiz || lesson.isFinalQuiz ||
                  // If this is a quiz and its ID matches a final quiz in the quizzes list
                  (lesson.content_type === 'quiz' && lesson.quiz_id &&
                    quizzes.some(q => q.id === lesson.quiz_id && q.isFinal))),
              }))
            }));
            setModules(formattedModules);
          } catch (error) {
            console.error('Error loading modules:', error);
          }
        }
      }
    }
  }, [open, course]);

  // ... (rest of the code remains the same)
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        toast.error('Please upload a valid image file (jpg, jpeg, png, webp,gif)');
        return;
      }

      // Get thumbnail max size from environment variable (in MB)
      const thumbnailMaxSizeMB = parseInt(process.env.NEXT_PUBLIC_THUMBNAIL_MAX_LIMIT || '1024', 10);
      const thumbnailMaxSizeBytes = thumbnailMaxSizeMB * 1024 * 1024;
      
      if (file.size > thumbnailMaxSizeBytes) {
        toast.error(`Image size should be less than ${thumbnailMaxSizeMB}MB`);
        return;
      }

      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setThumbnailPreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIntroVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['mp4', 'webm', 'ogg', 'mov', 'mkv'];

      // Check if the file extension is valid
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        toast.error('Please upload a valid video file (mp4, webm, ogg, mov, mkv)');
        return;
      }

      // Check valid MIME types
      const validMimeTypes = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime', // .mov
        'video/x-matroska' // .mkv
      ];

      if (!validMimeTypes.includes(file.type)) {
        toast.error(`Invalid video format: ${file.type}. Please upload a valid video file.`);
        return;
      }
      console.log("file", file);

      // Get video max size from environment variable (in MB)
      const videoMaxSizeMB = parseInt(process.env.NEXT_PUBLIC_VIDEO_MAX_LIMIT || '1024', 10);
      const videoMaxSizeBytes = videoMaxSizeMB * 1024 * 1024;
      
      // Check file size against the environment variable limit
      if (file.size > videoMaxSizeBytes) {
        toast.error(`Video size should be less than ${videoMaxSizeMB}MB`);
        return;
      }

      setIntroVideoFile(file);
      // Clear URL if in upload mode
      if (introVideoSource === 'upload') {
        setValue('introVideoUrl', '');
      }
    }
  };

  const addLearningItem = () => {
    if (newLearningItem.trim()) {
      setValue("whatYouWillLearn", [...watch('whatYouWillLearn'), newLearningItem.trim()]);
      setNewLearningItem("");
    }
  };

  const removeLearningItem = (index: number) => {
    setValue(
      "whatYouWillLearn",
      watch('whatYouWillLearn').filter((_, i) => i !== index)
    );
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setValue("requirements", [...watch('requirements'), newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    setValue(
      "requirements",
      watch('requirements').filter((_, i) => i !== index)
    );
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      // Remove special characters
      .replace(/[^\w\s-]/g, '')
      // Replace whitespace (one or more) with a single hyphen
      .replace(/\s+/g, '-')
      // Collapse multiple hyphens into one
      .replace(/-+/g, '-')
      // Remove leading or trailing hyphens
      .replace(/^[-]+|[-]+$/g, '');
  };

  const onSubmit = async (data: FormValues) => {
    // Log form submission data for debugging
    console.log('Form submission data:', data);

    try {
      setIsSubmitting(true);
      console.log('Submitting form with data:', data);
      console.log('Modules:', modules);

      // Function to check if the last module has only a single lesson that is a final quiz
      const isLastModuleFinalQuiz = (modules: ModuleForm[]) => {
        if (!modules || modules.length === 0) return false;
        
        const lastModule = modules[modules.length - 1];
        
        // Check if the last module has exactly one lesson
        if (!lastModule.lessons || lastModule.lessons.length !== 1) return false;
        
        // Check if that lesson is a quiz and is marked as final
        const lesson = lastModule.lessons[0];
        return lesson.contentType === 'quiz' && ensureBoolean(lesson.isFinalQuiz);
      };
      
      // Final validation: Check that the course has exactly one final quiz
      const finalQuizCount = modules.reduce((count, module) => {
        const moduleFinalQuizCount = module.lessons.filter(lesson =>
          lesson.contentType === 'quiz' && ensureBoolean(lesson.isFinalQuiz)
        ).length;
        return count + moduleFinalQuizCount;
      }, 0);


      if (finalQuizCount === 0) {
        toast.error('The course must have one final quiz. Please add a final quiz before submitting.', {
          position: 'top-center',
          duration: 4000
        });
        setIsSubmitting(false);
        return;
      }
      
      // Check if the last module contains only a single final quiz lesson
      if (!isLastModuleFinalQuiz(modules)) {
        toast.error('The last module must contain only a single lesson which is the final quiz.', {
          position: 'top-center',
          duration: 5000
        });
        setIsSubmitting(false);
        return;
      }

      // Validate modules and lessons
      if (modules.length === 0) {
        toast.error("Please add at least one module");
        setActiveStep(1); // Go to module step
        setIsSubmitting(false);
        return;
      }

      // Check if each module has at least one lesson
      const emptyModules = modules.filter(mod => mod.lessons.length === 0);
      if (emptyModules.length > 0) {
        toast.error(`Module "${emptyModules[0].title}" has no lessons. Please add at least one lesson to each module.`);
        setActiveStep(1); // Go to module step
        setIsSubmitting(false);
        return;
      }

      // Create a slug from the title
      const slug = generateSlug(data.title);

      // Prepare modules data for both create and update operations
      const modulesData = modules.map((mod, modIndex) => ({
        // Include ID for existing modules if available
        ...(mod.id ? { id: mod.id } : {}),
        title: mod.title,
        order_position: modIndex + 1,
        lessons: mod.lessons.map((lesson, lessonIndex) => ({
          // Include ID for existing lessons if available
          ...(lesson.id ? { id: lesson.id } : {}),
          title: lesson.title,
          content_type: lesson.contentType,
          video_url: lesson.contentType === 'video' ? lesson.video_url ?? "" : undefined,
          lesson_text: lesson.contentType === 'text' ? lesson.lesson_text ?? "" : undefined,
          quiz_id: lesson.contentType === 'quiz' ? lesson.quiz_id ?? "" : undefined,
          duration: lesson.durationMinutes,
          order_position: lessonIndex + 1,
        }))
      }));

      if (isNewCourse) {
        // Validate thumbnail for new courses
        if (!thumbnailFile) {
          toast.error("Please upload a thumbnail image");
          console.log('Validation failed: No thumbnail image');
          setActiveStep(0); // Go back to first step
          setIsSubmitting(false);
          return;
        }

        // Validate intro video source when upload option is selected
        if (introVideoSource === 'upload' && !introVideoFile) {
          toast.error("Please upload an intro video or switch to URL option");
          setActiveStep(0); // Go back to first step
          setIsSubmitting(false);
          return;
        }

        // For new courses, use FormData to handle file uploads
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("subtitle", data.subtitle);
        formData.append("description", data.description);
        formData.append("difficulty", data.difficulty);
        formData.append("category_id", data.categoryId.toString());
        formData.append("is_published", data.isPublished ? "true" : "false");
        formData.append("slug", slug);
        // Add instructor_id from the current user - required field
        formData.append("instructor_id", currentUser?.id.toString() || '');
        console.log('Adding instructor_id:', currentUser?.id);

        // Handle intro video based on selected source
        if (introVideoSource === 'url') {
          formData.append("intro_video_url", data.introVideoUrl ?? "");
        } else {
          // For upload option, we'll handle the URL generation on the backend
          // We're not sending intro_video_url as the backend will generate it
          if (introVideoFile) {
            formData.append("intro_video", introVideoFile);
          }
        }

        // Handle lesson videos for each module
        if (modulesData) {
          modulesData.forEach((module, moduleIndex) => {
            if (module.lessons) {
              module.lessons.forEach((lesson, lessonIndex) => {
                // Only process video content type lessons
                if (lesson.content_type === 'video') {
                  // Get the corresponding lesson from the original modules array to access the file
                  const originalModule = modules[moduleIndex];
                  if (originalModule && originalModule.lessons && originalModule.lessons[lessonIndex]) {
                    const originalLesson = originalModule.lessons[lessonIndex];

                    // If this lesson has an uploaded video file, add it to the form data
                    if (originalLesson.video_source === 'upload' && originalLesson.uploaded_video_file) {
                      // Use lesson_id for existing lessons or a generic identifier for new lessons
                      const fileKey = lesson.id ? `lesson_video_${lesson.id}` : `lesson_video_new_${moduleIndex}_${lessonIndex}`;
                      formData.append(fileKey, originalLesson.uploaded_video_file);
                      console.log(`Added lesson video file for ${fileKey}:`, originalLesson.uploaded_video_file.name);
                    }
                  }
                }
              });
            }
          });
        }

        // Add arrays as JSON strings
        formData.append("what_you_will_learn", JSON.stringify(Array.isArray(data.whatYouWillLearn) ? data.whatYouWillLearn : []));
        formData.append("course_requirements", JSON.stringify(Array.isArray(data.requirements) ? data.requirements : []));
        formData.append("modules", JSON.stringify(modulesData));

        // Add thumbnail file
        if (thumbnailFile) {
          formData.append("thumbnail", thumbnailFile);
        }

        console.log('Creating new course with FormData');
        await createCourse(formData);
        alertSuccess('Course created successfully!');
        handleModalClose();
      } else if (course) {
        // Check if any lesson has an uploaded video file
        const hasLessonVideoFiles = modules.some(module => 
          module.lessons.some(lesson => 
            lesson.uploaded_video_file !== null && lesson.uploaded_video_file !== undefined
          )
        );
        
        // Debug log to see if we're detecting video files
        console.log('Detected lesson video files:', hasLessonVideoFiles);
        
        // Also check if any video lesson was modified and has a video_source of 'upload'
        const hasVideoSourceUpload = modules.some(module => 
          module.lessons.some(lesson => 
            lesson.contentType === 'video' && lesson.video_source === 'upload'
          )
        );
        
        console.log('Detected video_source=upload:', hasVideoSourceUpload);
        
        // For updates, check if we have a new thumbnail file, intro video, or lesson videos
        if (thumbnailFile || introVideoFile || hasLessonVideoFiles || hasVideoSourceUpload) {
          console.log('Using FormData approach for course update with files');
          // If we have a new thumbnail, use FormData for the update
          console.log('Updating course with new thumbnail using FormData');
          const formData = new FormData();
          formData.append("title", data.title);
          formData.append("subtitle", data.subtitle);
          formData.append("description", data.description);
          formData.append("difficulty", data.difficulty);
          formData.append("category_id", data.categoryId.toString());
          formData.append("is_published", data.isPublished ? "true" : "false");
          formData.append("slug", slug);
          formData.append("instructor_id", currentUser?.id.toString() || '');
          if (introVideoFile) {
            formData.append("intro_video", introVideoFile);
          }
          else if (introVideoSource === "url" && data.introVideoUrl) {
            formData.append("intro_video_url", data.introVideoUrl);
          }

          // Add arrays as JSON strings
          formData.append("what_you_will_learn", JSON.stringify(Array.isArray(data.whatYouWillLearn) ? data.whatYouWillLearn : []));
          formData.append("course_requirements", JSON.stringify(Array.isArray(data.requirements) ? data.requirements : []));
          formData.append("modules", JSON.stringify(modulesData));

          // Add the new thumbnail file
          if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
          
          // Handle lesson videos for each module
          if (modulesData) {
            modulesData.forEach((module, moduleIndex) => {
              if (module.lessons) {
                module.lessons.forEach((lesson, lessonIndex) => {
                  // Only process video content type lessons
                  if (lesson.content_type === 'video') {
                    // Get the corresponding lesson from the original modules array to access the file
                    const originalModule = modules[moduleIndex];
                    if (originalModule && originalModule.lessons && originalModule.lessons[lessonIndex]) {
                      const originalLesson = originalModule.lessons[lessonIndex];
                      
                      // If this lesson has an uploaded video file, add it to the form data
                      if (originalLesson.video_source === 'upload' && originalLesson.uploaded_video_file) {
                        // Use lesson_id for existing lessons or temp_id for new lessons
                        const fileKey = lesson.id 
                          ? `lesson_video_${lesson.id}` 
                          : originalLesson.temp_id 
                            ? `lesson_video_new_${originalLesson.temp_id}` 
                            : `lesson_video_new_${moduleIndex}_${lessonIndex}`;
                        
                        formData.append(fileKey, originalLesson.uploaded_video_file);
                        console.log(`Added lesson video file for ${fileKey}:`, originalLesson.uploaded_video_file.name);
                        
                        // Mark this lesson as having an uploaded file in the modules JSON data
                        // This helps the backend identify which lessons have pending uploads
                        lesson.video_source = 'upload';
                        if (originalLesson.temp_id) {
                          lesson.temp_id = originalLesson.temp_id;
                        }
                      }
                    }
                  }
                });
              }
            });
          }

          await updateCourse({
            slug: course?.slug || '',
            formData: formData
          });
        } else {
          // If no new thumbnail, use JSON API to preserve data types
          const courseData = {
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            difficulty: data.difficulty,
            category_id: data.categoryId,
            is_published: data.isPublished,
            slug: slug,
            intro_video_url: data.introVideoUrl ?? '',
            // Important: Add instructor_id to course updates as well
            instructor_id: currentUser?.id,
            // Preserve the existing thumbnail_url when not uploading a new thumbnail
            thumbnail_url: course?.thumbnail_url || '',
            what_you_will_learn: Array.isArray(data.whatYouWillLearn) ? data.whatYouWillLearn : [],
            course_requirements: Array.isArray(data.requirements) ? data.requirements : [],
            modules: modulesData
          };

          console.log('Updating course with JSON data:', courseData);
          await updateCourseWithJson({
            slug: course?.slug || '',
            courseData: courseData
          });
        }

        alertSuccess('Course updated successfully!');
        handleModalClose();
      }
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    reset({
      title: "",
      subtitle: "",
      description: "",
      difficulty: "beginner",
      categoryId: 0,
      isPublished: false,
      whatYouWillLearn: [],
      requirements: [],
      introVideoUrl: ""
    });
    setThumbnailPreview('');
    setThumbnailFile(null);
    setModules([]);
    setActiveStep(0);
    setNewLearningItem('');
    setCurrentLesson({});
    setCurrentModule({});
    setIntroVideoFile(null);
    setShowLessonForm(false);
    setShowModuleForm(false);
    setNewRequirement('');
    setEditingModuleIndex(null);
    setEditingLessonIndex(null);
    onClose();
  };

  return (
    <Dialog
      open={open && !isConfirmDialogOpen}
      onClose={handleModalClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" component="span">
          {title}
        </Typography>
        {!isSubmitting && (
          <IconButton onClick={handleModalClose} size="small">
            <X className="h-5 w-5" />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <div className="w-full mb-6">
          <Stepper activeStep={activeStep} alternativeLabel>
            <Step>
              <StepLabel>
                Course Informations
              </StepLabel>
            </Step>
            <Step>
              <StepLabel className="inline">
                Module Informations
              </StepLabel>
            </Step>
            <Step>
              <StepLabel>
                Done
              </StepLabel>
            </Step>
          </Stepper>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col w-full">
          {activeStep === 0 && (
            <div className="flex flex-col gap-4" id="course-informations">
              <div className="space-y-2 w-full gap-4 flex justify-between">
                <div className="flex-1">
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Title"
                        variant="outlined"
                        fullWidth
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        disabled={isSubmitting}
                        value={field.value ?? ""}
                      />
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Controller
                    name="subtitle"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Subtitle"
                        variant="outlined"
                        fullWidth
                        error={!!errors.subtitle}
                        helperText={errors.subtitle?.message}
                        disabled={isSubmitting}
                        value={field.value ?? ""}
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <div className="h-32 w-full">
                      <RichTextEditor
                        initialValue={field.value ?? ""}
                        maxHeight="85px"
                        maxWidth="max-w-full"
                        onChange={field.onChange}
                        placeholder="Enter course description..."
                        maxChars={5000}

                      />
                    </div>
                  )}
                />
              </div>

              <div>
                <Controller
                  name="whatYouWillLearn"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={watch('whatYouWillLearn')}
                      inputValue={newLearningItem}
                      onInputChange={(_, newInput) => setNewLearningItem(newInput)}
                      onChange={(_, newValues) => {
                        setValue("whatYouWillLearn", newValues as string[]);
                      }}
                      disableClearable
                      clearOnBlur={false}
                      disableCloseOnSelect
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={option + index}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="What you will learn?"
                          placeholder="Type and press Enter"
                          error={!!errors.whatYouWillLearn}
                          helperText={errors.whatYouWillLearn?.message}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newLearningItem.trim()) {
                              e.preventDefault();
                              setValue("whatYouWillLearn", [...watch('whatYouWillLearn'), newLearningItem.trim()]);
                              setNewLearningItem("");
                            }
                          }}
                        />
                      )}
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  name="requirements"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={watch('requirements')}
                      inputValue={newRequirement}
                      onInputChange={(_, newInput) => setNewRequirement(newInput)}
                      onChange={(_, newValues) => {
                        setValue("requirements", newValues as string[]);
                      }}
                      disableClearable
                      clearOnBlur={false}
                      disableCloseOnSelect
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={option + index}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Requirements?"
                          placeholder="Type and press Enter"
                          error={!!errors.requirements}
                          helperText={errors.requirements?.message}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newRequirement.trim()) {
                              e.preventDefault();
                              setValue("requirements", [...watch('requirements'), newRequirement.trim()]);
                              setNewRequirement("");
                            }
                          }}
                        />
                      )}
                    />
                  )}
                />
              </div>

              <div className="flex  gap-4">
                <div className="flex-1">
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.difficulty}>
                        <InputLabel>Level</InputLabel>
                        <Select
                          {...field}
                          label="Difficulty"
                          disabled={isSubmitting}
                          defaultValue="beginner"
                          value={field.value ?? "beginner"}
                        >
                          <MenuItem value="beginner">Beginner</MenuItem>
                          <MenuItem value="intermediate">Intermediate</MenuItem>
                          <MenuItem value="advanced">Advanced</MenuItem>
                          <MenuItem value="allLevel">AllLevel</MenuItem>


                        </Select>
                        {!!errors.difficulty && (
                          <FormHelperText>{errors.difficulty.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                          labelId="category-label"
                          label="Category"
                          {...field}
                          disabled={isLoadingCategories}
                          value={field.value ?? 0}
                        >
                          <MenuItem value={0} disabled>Select Category</MenuItem>
                          {isLoadingCategories ? (
                            <MenuItem value={0}>Loading categories...</MenuItem>
                          ) : categories && categories.length > 0 ? (
                            categories.map((category: Category) => (
                              <MenuItem key={category.id} value={category.id}>
                                {category.name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem value={0}>No categories available</MenuItem>
                          )}
                        </Select>
                        {fieldState.error && (
                          <FormHelperText>{fieldState.error.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <TextField
                    label="Instructor"
                    variant="outlined"
                    fullWidth
                    value={user?.full_name || ''}
                    disabled
                  />
                </div>
                <div className="flex-1">
                  <Controller
                    name="isPublished"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Publication Status</InputLabel>
                        <Select
                          {...field}
                          label="Publication Status"
                          disabled={isSubmitting}
                          // Fix for TypeScript error - ensure value is always boolean
                          value={field.value === '' ? undefined : field.value}
                          onChange={(e) => {
                            // Ensure we only set true/false values, not empty strings
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : Boolean(value));
                          }}
                        >
                          <MenuItem value="false">Draft</MenuItem>
                          <MenuItem value="true">Published</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Typography variant="subtitle2" gutterBottom>
                  Thumbnail
                </Typography>
                {/* Show current thumbnail when editing */}
                {!isNewCourse && thumbnailPreview && !thumbnailFile && (
                  <div className="mb-4">
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Thumbnail:
                    </Typography>
                    <div className="relative w-full h-36 border rounded overflow-hidden">
                      {thumbnailPreview && (
                        <Image
                          src={thumbnailPreview || '/placeholder-image.jpg'}
                          alt="Current thumbnail"
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  </div>
                )}
                <div className={`flex flex-col p-4 border-2 border-dashed rounded-md ${thumbnailError ? 'border-red-500' : (thumbnailFile ? 'border-green-500' : 'border-gray-300')}`}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<Upload className="h-4 w-4" />}
                    sx={{ py: 1.5, borderColor: thumbnailError ? 'red' : undefined }}
                    disabled={isSubmitting}
                  >
                    {!isNewCourse ? 'Change Thumbnail' : 'Upload Thumbnail'}
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        handleThumbnailChange(e);
                        setThumbnailError(null); // Clear error when selecting a file
                      }}
                    />
                  </Button>
                  {
                    isNewCourse && thumbnailFile && (
                
                    <Box mt={1} display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                      File selected: {thumbnailFile.name} ({Math.round(thumbnailFile.size / 1024)} KB)
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setThumbnailFile(null)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </IconButton>
                  </Box>
                    )
                  }
                  {thumbnailFile && !isNewCourse && (
                    <div className="mt-4">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                         Thumbnail Preview
                      </Typography>
                      <div className="relative w-full h-36 border rounded overflow-hidden">
                        {thumbnailPreview && (
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                        File selected: {thumbnailFile.name} ({Math.round(thumbnailFile.size / 1024)} KB)
                      </Typography>
                      <Button
                        startIcon={<X size={16} />}
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => {
                          setThumbnailFile(null);
                          // If editing, restore the original thumbnail preview
                          if (!isNewCourse && course?.thumbnail_url) {
                            const thumbnailUrl = course.thumbnail_url.startsWith('http')
                              ? course.thumbnail_url
                              : `${process.env.NEXT_PUBLIC_API_URL}${course.thumbnail_url}`;
                            setThumbnailPreview(thumbnailUrl);
                          } else {
                            setThumbnailPreview("");
                          }
                        }}
                        sx={{ mt: 1 }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  {thumbnailError && (
                    <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                      {thumbnailError}
                    </Typography>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <Typography variant="subtitle2" gutterBottom>
                  Intro Video
                </Typography>

                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <RadioGroup
                    row
                    value={introVideoSource}
                    onChange={(e) => {
                      const newSource = e.target.value as "url" | "upload";
                      const previousSource = introVideoSource;
                      setIntroVideoSource(newSource);
                      
                      // Only clear values when actually changing sources and uploading a new file
                      // This preserves existing values when toggling between options
                      if (newSource === "url" && previousSource === "upload" && introVideoFile) {
                        // Switching from upload to URL - keep the URL if it exists
                        setValue("introVideoUrl", "");

                        setVideoUrlFileError(null);
                        // Don't clear introVideoUrl value to preserve it
                      } else if (newSource === "upload" && previousSource === "url" && introVideoFile && getValues("introVideoUrl") ) {
                        // Switching from URL to upload - keep the file if it exists
                        // Only clear URL if user actually uploads a new file (handled in handleIntroVideoChange)
                        setVideoUrlFileError(null);
                        setIntroVideoFile(null);
                        // Don't clear the URL until a new file is uploaded
                      }
                    }}
                  >
                    <FormControlLabel value="url" control={<Radio />} label="Provide URL" />
                    <FormControlLabel value="upload" control={<Radio />} label={
                      course?.intro_video_url?.includes('/uploads') ? (
                        <span>
                          Upload Video,
                          <Typography component="span" color="warning" variant="body2" fontSize={14}>
                            If you did'nt upload a new video the last one will be used
                          </Typography>
                        </span>
                      ) : (
                        'Upload Video'
                      )
                    } />
                  </RadioGroup>
                </FormControl>

                {introVideoSource === "url" ? (
                  <Controller
                    name="introVideoUrl"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Intro Video URL"
                        variant="outlined"
                        fullWidth
                        placeholder="Enter video URL (.mp4, .webm, .ogg, .mov, .mkv)"
                        error={!!errors.introVideoUrl || (field.value && !isValidVideoUrl(field.value))}
                        helperText={
                          errors.introVideoUrl?.message ||
                          (field.value && !isValidVideoUrl(field.value) ?
                            "Please enter a valid video URL with supported extensions (.mp4, .webm, .ogg, .mov, .mkv)" : "")
                        }
                        disabled={isSubmitting}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          field.onChange(e);
                          // Clear error when user types
                          if (e.target.value) setVideoUrlFileError(null);
                        }}
                      />
                    )}
                      
                  />
                  
                ) : (
                
                  <>  <div className={`p-4 border-2 border-dashed rounded-md ${videoUrlFileError ? 'border-red-500' : (!introVideoFile ? 'border-gray-300' : 'border-green-500')}`}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<Upload className="h-4 w-4" />}
                      fullWidth
                      sx={{ py: 1.5, borderColor: videoUrlFileError ? 'red' : undefined }}
                      disabled={isSubmitting}
                    >
                      {introVideoFile || course?.intro_video_url?.includes("uploads") ? "Change Video" : "Upload Intro Video"}
                      <input
                        type="file"
                        hidden
                        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                        onChange={(e) => {
                          handleIntroVideoChange(e);
                          setVideoUrlFileError(null); // Clear error when selecting a file
                        }}
                        disabled={isSubmitting}
                      />
                    </Button>
                    {introVideoFile && (
                      <Box mt={1} display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="success.main" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%',fontSize:'12px' }}>
                        File selected:    {introVideoFile.name} ({Math.round(introVideoFile.size / 1024 / 1024 * 10) / 10} MB)
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setIntroVideoFile(null)}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </IconButton>
                      </Box>
                    )}
 
                    {videoUrlFileError && (
                      <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                        {videoUrlFileError}
                      </Typography>
                    )}
                    
                  </div>
                    {/* Show existing uploaded video info if editing */}
   {
                        course?.intro_video_url &&
                        course.intro_video_url.includes('/uploads') && !introVideoFile && !getValues("introVideoUrl") && (
                         <Typography variant="body2" color="text.secondary" sx={{ mt: 1,mb:1 }}>
                           Current video: {course.intro_video_url?.slice(0,50)+"..."}
                         </Typography>
                       )}
                  </>
                )}

              </div>
            </div>
          )}
          {activeStep === 1 && (
            <div className="flex flex-col gap-4" id="module-informations">
              {/* Warning about final quiz requirement */}
              <Box sx={{ mb: 2, p: 2, bgcolor: '#fff9c4', borderRadius: 1, border: '1px solid #ffd54f' }}>  
                <Typography variant="subtitle2" color="warning.dark" sx={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', fontWeight: 'bold' }}>⚠️ Important:</span>
                  The last module of your course must contain exactly one lesson, which must be marked as the final quiz.
                </Typography>
              </Box>
              
              {/* Step 2: Module & Lesson Management */}
              {/* --- Module List with Move Up/Down --- */}
              {modules.length > 0 && (
                <div className="mb-2">
                  {modules.map((mod, idx) => (
                    <ModuleItem
                      key={`module-${idx}`}
                      module={mod}
                      index={idx}
                    />
                  ))}
                </div>
              )}
              {/* --- Add New Module Button --- */}
              {!showModuleForm && (
                <Button variant="contained" color="primary" onClick={handleAddNewModule}>
                  Add New Module
                </Button>
              )}
              {/* --- Module Form --- */}
              {showModuleForm && (
                <Card sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>{editingModuleIndex !== null ? 'Edit Module' : 'Add Module'}</Typography>
                  <TextField
                    label="Module Title"
                    value={currentModule.title}
                    onChange={e => setCurrentModule(mod => ({ ...mod, title: e.target.value }))}
                    fullWidth
                    margin="normal"
                    required
                    error={!currentModule.title.trim()}
                    helperText={!currentModule.title.trim() ? 'Module title is required' : ''}
                  />
                  <TextField
                    label="Order Position"
                    type="number"
                    value={currentModule.order}
                    disabled={true}
                    fullWidth
                    margin="normal"
                    helperText={editingModuleIndex !== null ?
                      `Current position: ${currentModule.order} (use up/down buttons to change)` :
                      `Will be added at position: ${currentModule.order}`}
                  />
                  {/* Lessons List with Move Up/Down */}
                  {currentModule.lessons.length > 0 && (
                    <Box mb={2}>
                      {currentModule.lessons.map((lesson, idx) => (
                        <LessonItem
                          key={`lesson-${idx}`}
                          lesson={lesson}
                          lessonIndex={idx}
                        />
                      ))}
                    </Box>
                  )}
                  {/* Add New Lesson Button */}
                  {!showLessonForm && (
                    <Button variant="outlined" onClick={() => {
                      // Calculer le prochain ordre en fonction du nombre de leçons existantes
                      const nextLessonOrder = Math.max(1, currentModule.lessons.length + 1);

                      // Réinitialiser le formulaire de leçon avec les valeurs par défaut
                      setCurrentLesson({
                        title: '',
                        order: nextLessonOrder,
                        durationMinutes: 1,
                        contentType: 'video',
                        isFinalQuiz: false,
                        video_url: '',
                        video_source: 'url',
                        uploaded_video_file: null,
                        lesson_text: '',
                        quiz_id: null
                      });

                      // Afficher le formulaire
                      setShowLessonForm(true);
                      setEditingLessonIndex(null);
                      setLessonError(null);

                      // Log pour débogage
                      console.log(`Setting new lesson order to: ${nextLessonOrder} (lessons count: ${currentModule.lessons.length})`);
                    }} sx={{ mb: 2 }}>
                      Add New Lesson
                    </Button>
                  )}
                  {/* Lesson Form */}
                  {showLessonForm && (
                    <Box mb={2} sx={{ border: '1px solid #eee', borderRadius: 1, p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>{editingLessonIndex === null ? 'Add' : 'Edit'} Lesson</Typography>
                      <TextField
                        label="Lesson Title"
                        value={currentLesson.title}
                        onChange={e => setCurrentLesson(l => ({ ...l, title: e.target.value }))}
                        fullWidth
                        margin="normal"
                        required
                        error={lessonError !== null && !currentLesson.title.trim()}
                        helperText={lessonError !== null && !currentLesson.title.trim() ? 'Lesson title is required' : ''}
                      />
                      <TextField
                        label="Order Position"
                        type="number"
                        value={currentLesson.order}
                        disabled={true}
                        fullWidth
                        margin="normal"
                        helperText={editingLessonIndex !== null ?
                          `Current position: ${currentLesson.order} (use up/down buttons to change)` :
                          `Will be added at position: ${currentLesson.order}`}
                      />
                      <TextField
                        label="Duration (minutes)"
                        type="number"
                        value={currentLesson.durationMinutes}
                        onChange={e => setCurrentLesson(l => ({ ...l, durationMinutes: Number(e.target.value) }))}
                        fullWidth
                        margin="normal"
                        required
                        disabled={currentLesson.contentType === 'video' && currentLesson.video_source === 'upload' && currentLesson.uploaded_video_file !== null}
                        error={lessonError !== null && currentLesson.durationMinutes <= 0}
                        helperText={currentLesson.contentType === 'video' && currentLesson.video_source === 'upload' && currentLesson.uploaded_video_file !== null ? 
                          'Duration automatically detected from video' : 
                          (lessonError !== null && currentLesson.durationMinutes <= 0 ? 'Duration must be greater than 0' : '')}
                      />
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Content Type</InputLabel>
                        <Select
                          label="Content Type"
                          value={currentLesson.contentType}
                          onChange={e => setCurrentLesson(l => ({ ...l, contentType: e.target.value as LessonForm['contentType'] }))}
                        >
                          <MenuItem value="video">Video</MenuItem>
                          <MenuItem value="quiz">Quiz</MenuItem>
                          <MenuItem value="text">Text</MenuItem>
                        </Select>
                      </FormControl>
                      {currentLesson.contentType === 'quiz' && (
                        <>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={ensureBoolean(currentLesson.isFinalQuiz)}
                                // Disable the checkbox if:
                                // 1. The current lesson is NOT already a final quiz AND
                                // 2. There's already another final quiz in the course
                                // This ensures we can always uncheck our own final quiz but can't add a second one
                                disabled={!ensureBoolean(currentLesson.isFinalQuiz) && hasFinalQuiz(editingLessonIndex)}
                                onChange={(e) => {
                                  const isFinal = ensureBoolean(e.target.checked);

                                  // If trying to check but another lesson already has final quiz
                                  // This is a safety check in case the disabled state is bypassed
                                  if (isFinal && hasFinalQuiz(editingLessonIndex)) {
                                    toast.error('A course can only have one final quiz. Please uncheck the existing final quiz first.');
                                    return;
                                  }

                                  // If setting as final quiz, filter only final quizzes
                                  setCurrentLesson((prev: LessonForm) => ({
                                    ...prev,
                                    isFinalQuiz: isFinal,
                                    // If unchecking, reset quiz_id to null (to match type)
                                    quiz_id: !isFinal ? null : (
                                      prev.quiz_id !== null && !quizzes.find(q => q.id === prev.quiz_id && Boolean(q.isFinal)) ? null : prev.quiz_id
                                    )
                                  }));
                                }}
                              />
                            }
                            label="Final Quiz?"
                            title={!ensureBoolean(currentLesson.isFinalQuiz) && hasFinalQuiz(editingLessonIndex) ?
                              'Another lesson is already set as the final quiz. Uncheck that one first.' :
                              'Mark this quiz as the final quiz for the course'}
                          />
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Select Quiz</InputLabel>
                            <Select
                              label="Select Quiz"
                              value={currentLesson.quiz_id === null ? '' : currentLesson.quiz_id}
                              onChange={(e) => {
                                // Convert empty strings to null, otherwise parse as number
                                const quizId = e.target.value === '' ? null : Number(e.target.value);
                                // Find the selected quiz in our processed quiz array
                                const selectedQuiz = quizId ? quizzes.find(q => q.id === quizId) : null;
                                console.log('Selected quiz:', selectedQuiz);
                                setCurrentLesson(l => ({
                                  ...l,
                                  quiz_id: quizId,
                                  // Update the isFinalQuiz property based on the selected quiz
                                  isFinalQuiz: selectedQuiz ? ensureBoolean(selectedQuiz.isFinal) : ensureBoolean(l.isFinalQuiz)
                                }));
                              }}
                            >
                              <MenuItem value="">-- Select a Quiz --</MenuItem>
                              {/* Show a message if no quizzes match the filter */}
                              {ensureBoolean(currentLesson.isFinalQuiz) && !quizzes.some(quiz => Boolean(quiz.isFinal)) && (
                                <MenuItem disabled>
                                  No final quizzes available - please create one first
                                </MenuItem>
                              )}
                              {!ensureBoolean(currentLesson.isFinalQuiz) && !quizzes.some(quiz => !Boolean(quiz.isFinal)) && (
                                <MenuItem disabled>
                                  No non-final quizzes available - please create one first
                                </MenuItem>
                              )}
                              {quizzes
                                .filter(quiz => ensureBoolean(currentLesson.isFinalQuiz) ? Boolean(quiz.isFinal) : !Boolean(quiz.isFinal))
                                .map(quiz => (
                                  <MenuItem key={quiz.id} value={quiz.id}>
                                    {quiz.title} {Boolean(quiz.isFinal) ? '(Final Quiz)' : ''} - {quiz.question_count} questions
                                  </MenuItem>
                                ))}
                            </Select>
                            {!currentLesson.quiz_id && (
                              <FormHelperText error>Please select a quiz</FormHelperText>
                            )}
                          </FormControl>
                        </>
                      )}
                      {currentLesson.contentType === 'video' && (
                        <>
                          <div className="flex-1 mt-2">
                            <Typography variant="subtitle2" gutterBottom>
                              Lesson Video
                            </Typography>

                            <FormControl component="fieldset" sx={{ mb: 2 }}>
                              <RadioGroup
                                row
                                value={currentLesson.video_source || 'url'}
                                onChange={(e) => {
                                  const newSource = e.target.value as "url" | "upload";
                                  const previousSource = currentLesson.video_source ;
                                  if (newSource === "url" && previousSource === "upload" && currentLesson.uploaded_video_file) {
                              
                                     // Update the lesson's video source
                                  setCurrentLesson(l => ({ 
                                    ...l, 
                                    video_source: newSource,
                                    // Clear the other option when switching
                                    ...( { video_url: '' })
                                  }));
                                  // Clear any lesson errors when switching between options
                                  setLessonError(null);
                                    // Don't clear introVideoUrl value to preserve it
                                  } else if (newSource === "upload" && previousSource === "url" && currentLesson.video_url ) {
                                    setCurrentLesson(l => ({ 
                                      ...l, 
                                      video_source: newSource,
                                      // Clear the other option when switching
                                      ...( { uploaded_video_file:null })
                                    }));
                                    
                                    
                                  }else{
                                    setCurrentLesson(l => ({ 
                                      ...l, 
                                      video_source: newSource,
                                    }));
                                  }
                                }}
                              >
                                <FormControlLabel value="url" control={<Radio />} label="Provide URL" />
                                <FormControlLabel value="upload" control={<Radio />} label={
                                  editingLessonIndex !== null && currentModule.lessons[editingLessonIndex]?.video_url?.includes('/uploads') ? (
                                    <span>
                                      Upload Video
                                      <Typography component="span" color="warning" variant="body2" fontSize={14} sx={{ ml: 1 }}>
                                        (If you don't upload a new video, the existing one will be used)
                                      </Typography>
                                    </span>
                                  ) : (
                                    'Upload Video'
                                  )
                                } />
                              </RadioGroup>
                            </FormControl>

                            {(!currentLesson.video_source || currentLesson.video_source === "url") ? (
                              <div className="flex-1 mb-3 -mt-2">
                                <Typography variant="subtitle2" gutterBottom>
                                  Lesson Video URL
                                </Typography>
                                <TextField
                                  label="Video URL"
                                  variant="outlined"
                                  fullWidth
                                  placeholder="Enter video URL (.mp4, .webm, .ogg, .mov, .mkv)"
                                  value={currentLesson.video_url || ''}
                                  onChange={(e) => setCurrentLesson(l => ({ ...l, video_url: e.target.value }))}
                                  required
                                  error={lessonError !== null && currentLesson.video_source === 'url' && (!currentLesson.video_url || (currentLesson.video_url && !isValidVideoUrl(currentLesson.video_url)))}
                                />
                              </div>
                            ) : (
                              <div className={`p-4 border-2 border-dashed rounded-md mb-2 ${lessonError && currentLesson.video_source === 'upload' ? 'border-red-500' : (!currentLesson.uploaded_video_file ? 'border-gray-300' : 'border-green-500')}`}>
                                <Button
                                  component="label"
                                  variant="outlined"
                                  startIcon={<Upload className="h-4 w-4" />}
                                  fullWidth
                                  sx={{ 
                                    py: 1.5, 
                                    borderColor: (lessonError && currentLesson.video_source === 'upload' && 
                                                !currentLesson.uploaded_video_file && 
                                                !(editingLessonIndex !== null && currentModule.lessons[editingLessonIndex]?.video_url?.includes('/uploads'))) 
                                                ? 'error.main' : undefined,
                                    color: (lessonError && currentLesson.video_source === 'upload' && 
                                           !currentLesson.uploaded_video_file && 
                                           !(editingLessonIndex !== null && currentModule.lessons[editingLessonIndex]?.video_url?.includes('/uploads'))) 
                                           ? 'error.main' : undefined
                                  }}
                                  disabled={isSubmitting}
                                >
                                  {currentLesson.uploaded_video_file || 
                                   (editingLessonIndex !== null && currentModule.lessons[editingLessonIndex]?.video_url?.includes('/uploads')) 
                                    ? "Change Video" : "Upload Video"}
                                  <input
                                    type="file"
                                    hidden
                                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        const fileExtension = file.name.split('.').pop()?.toLowerCase();
                                        const validExtensions = ['mp4', 'webm', 'ogg', 'mov', 'mkv'];
                                        
                                        // Check if the file extension is valid
                                        if (!fileExtension || !validExtensions.includes(fileExtension)) {
                                          toast.error('Please upload a valid video file (mp4, webm, ogg, mov, mkv)');
                                          return;
                                        }
                                        
                                        // Check valid MIME types
                                        const validMimeTypes = [
                                          'video/mp4',
                                          'video/webm',
                                          'video/ogg',
                                          'video/quicktime', // .mov
                                          'video/x-matroska' // .mkv
                                        ];
                                        
                                        if (!validMimeTypes.includes(file.type)) {
                                          toast.error(`Invalid video format: ${file.type}. Please upload a valid video file.`);
                                          return;
                                        }
                                        
                                        // Get video max size from environment variable (in MB)
                                        const videoMaxSizeMB = parseInt(process.env.NEXT_PUBLIC_VIDEO_MAX_LIMIT || '1024', 10);
                                        const videoMaxSizeBytes = videoMaxSizeMB * 1024 * 1024;
                                        
                                        // Check file size against the environment variable limit
                                        if (file.size > videoMaxSizeBytes) {
                                          toast.error(`Video size should be less than ${videoMaxSizeMB}MB`);
                                          return;
                                        }
                                        
                                        // Create a video element to get metadata
                                        const video = document.createElement('video');
                                        video.preload = 'metadata';
                                        
                                        // Create object URL for the file
                                        const objectUrl = URL.createObjectURL(file);
                                        video.src = objectUrl;
                                        
                                        // Set up event handler for when metadata is loaded
                                        video.onloadedmetadata = () => {
                                          // Clean up the object URL
                                          URL.revokeObjectURL(objectUrl);
                                          
                                          // Get duration in seconds
                                          const durationInSeconds = video.duration;
                                          console.log('Video duration detected:', durationInSeconds, 'seconds');
                                          
                                          // Convert to minutes (rounded up to nearest minute)
                                          const durationInMinutes = Math.ceil(durationInSeconds / 60);
                                          console.log('Duration in minutes:', durationInMinutes);
                                          
                                          // Update the lesson with both the file and the detected duration
                                          setCurrentLesson(l => ({ 
                                            ...l, 
                                            uploaded_video_file: file, 
                                            video_url: '',
                                            durationMinutes: durationInMinutes || 1 // Ensure at least 1 minute
                                          }));
                                          
                                          setLessonError(null);
                                          // No toast notification as requested
                                        };
                                        
                                        // Handle errors in case the video can't be processed
                                        video.onerror = () => {
                                          console.error('Error loading video metadata');
                                          // Still set the file but don't update duration
                                          setCurrentLesson(l => ({ ...l, uploaded_video_file: file, video_url: '' }));
                                          setLessonError(null);
                                        };
                                      }
                                    }}
                                    disabled={isSubmitting}
                                  />
                                </Button>
                                {currentLesson.uploaded_video_file && (
                                  <Box mt={1} display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="caption" color="success.main" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%',fontSize:'12px' }}>
                                    File selected:   {currentLesson.uploaded_video_file.name} ({Math.round(currentLesson.uploaded_video_file.size / 1024 / 1024 * 10) / 10} MB)
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      onClick={() => setCurrentLesson(l => ({ ...l, uploaded_video_file: null }))}
                                      disabled={isSubmitting}
                                    >
                                      <X className="h-4 w-4" />
                                    </IconButton>
                                  </Box>
                                )}
                                
                                {/* Show existing uploaded video info if editing */}
                                {!currentLesson.uploaded_video_file && editingLessonIndex !== null && 
                                 currentModule.lessons[editingLessonIndex]?.video_url?.includes('/uploads') && !currentLesson.video_url && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1,mb:1 }}>
                                    Current video: {currentModule.lessons[editingLessonIndex].video_url?.slice(0,50)+"..."}
                                  </Typography>
                                )}
                                
                               
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      {currentLesson.contentType === 'text' && (
                        <div className="flex-1 mt-3">
                          <Typography variant="subtitle2" gutterBottom>
                            Lesson Content
                          </Typography>
                          <RichTextEditor
                            placeholder="write here the content of the lesson"
                            maxChars={5000}
                            initialValue={currentLesson.lesson_text || ''}
                            onChange={(html) => setCurrentLesson(l => ({ ...l, lesson_text: html }))}
                          />
                        </div>
                      )}
                      {lessonError && <Typography color="error" variant="body2">{lessonError}</Typography>}
                      <Box mt={1}>
                        <Button variant="contained" onClick={handleAddOrUpdateLesson}>
                          {editingLessonIndex !== null ? 'Save Changes' : 'Add Lesson'}
                        </Button>
                        <Button sx={{ ml: 2 }} onClick={() => {
                          // If we were editing, restore the lesson to the module
                          if (editingLessonIndex !== null) {
                            const lessonToRestore = currentModule.lessons.find((_, idx) => idx === editingLessonIndex);
                            if (!lessonToRestore) {
                              // If we can't find the lesson at that index, it means we need to restore the current lesson being edited
                              setCurrentModule(mod => {
                                const updatedLessons = [...mod.lessons];
                                updatedLessons.splice(editingLessonIndex, 0, currentLesson);
                                return { ...mod, lessons: updatedLessons };
                              });
                            }
                            setEditingLessonIndex(null);
                          }
                          setShowLessonForm(false);
                          setLessonError(null);
                          // Always reset lesson form state after cancel
                          setCurrentLesson({
                            title: '',
                            order: currentModule.lessons.length + 1,
                            durationMinutes: 1,
                            contentType: 'video',
                            isFinalQuiz: false,
                            video_url: '',
                            video_source: 'url',
                            uploaded_video_file: null,
                            lesson_text: '',
                            quiz_id: null
                          });
                        }}>
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}
                  {moduleError && <Typography color="error" variant="body2">{moduleError}</Typography>}
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleValidateModule}
                      disabled={currentModule.lessons.length < 1}
                    >
                      {editingModuleIndex !== null ? 'Save Changes' : 'Add Module'}
                    </Button>
                    <Button sx={{ ml: 2 }} onClick={() => {
                      // If we were editing, restore the module
                      if (editingModuleIndex !== null) {
                        setEditingModuleIndex(null);
                      }
                      // Reset module form
                      setShowModuleForm(false);

                      // IMPORTANT: Also reset lesson form state to prevent it from persisting
                      setShowLessonForm(false);
                      setCurrentLesson({
                        title: '',
                        order: 1,
                        durationMinutes: 1,
                        contentType: 'video',
                        isFinalQuiz: false,
                        video_url: '',
                        lesson_text: '',
                        quiz_id: null
                      });
                      setEditingLessonIndex(null);
                      setLessonError(null);
                    }}>
                      Cancel
                    </Button>
                  </Box>
                </Card>
              )}
            </div>
          )}
          {activeStep === 2 && (
            <div className="flex flex-col gap-4" id="summary-step">
              <Typography variant="h6" gutterBottom>Course Summary</Typography>

              {/* Course details summary */}
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Course Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Title</Typography>
                    <Typography variant="body1">{watch('title')}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Category</Typography>
                    <Typography variant="body1">
                      {categories.find((cat: Category) => cat.id === Number(watch('categoryId')))?.name || 'Not set'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Difficulty</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{watch('difficulty')}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Typography variant="body1">{ensureBoolean(watch('isPublished')) ? 'Published' : 'Draft'}</Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Modules summary */}
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Modules ({modules.length})</Typography>
                {modules.length > 0 ? (
                  <div>
                    {modules.map((mod, idx) => (
                      <Box key={idx} sx={{ mb: 1, p: 1, borderBottom: '1px solid #eee' }}>
                        <Typography variant="body1">{mod.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {mod.lessons.length} lessons • {getModuleTotalDuration(mod)} min
                        </Typography>
                      </Box>
                    ))}
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary">Total Duration</Typography>
                      <Typography variant="body1">
                        {modules.reduce((total, mod) => total + getModuleTotalDuration(mod), 0)} minutes
                      </Typography>
                    </Box>
                  </div>
                ) : (
                  <Typography variant="body2" color="text.secondary">No modules added yet</Typography>
                )}
              </Card>

              <Typography variant="body2" color="text.secondary">
                Review your course details above. Click {isNewCourse ? 'Create Course' : 'Update Course'} to save all information.
              </Typography>
            </div>
          )}


          <div className="flex justify-between mt-4">
            {activeStep > 0 ? (
              <Button
                variant="outlined"
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                disabled={isSubmitting}
              >
                Back
              </Button>
            ) : (
              <Button onClick={handleModalClose} disabled={isSubmitting}>
                Cancel
              </Button>
            )}

            <div className="flex-1"></div>

            {activeStep < 2 ? (
              <Button
                variant="contained"
                onClick={() => {
                  console.log('Next button clicked');
                  // Validate before proceeding to next step
                  if (activeStep === 0) {
                    // Clear all previous errors first
                    clearErrors();

                    // Use form validation to show inline errors instead of toast
                    // Check each field and set errors if needed
                    let hasErrors = false;

                    // Validate all required fields in one pass
                    const formValues = getValues();
                    const validationFields = [
                      { name: 'title', value: formValues.title, message: 'Course title is required' },
                      { name: 'subtitle', value: formValues.subtitle, message: 'Subtitle is required' },
                      { name: 'description', value: formValues.description, message: 'Description is required' },
                      { name: 'categoryId', value: formValues.categoryId, message: 'Category is required' },
                      { name: 'difficulty', value: formValues.difficulty, message: 'Level is required' },
                      { name: 'isPublished', value: formValues.isPublished !== undefined, message: 'Publication status is required' }
                    ];

                    // Handle intro video validation based on the selected source and edit/new course context
                    if (introVideoSource === 'url') {
                      // URL validation is needed when URL option is selected
                      if (!formValues.introVideoUrl || formValues.introVideoUrl.trim() === '') {
                        setError('introVideoUrl', { type: 'required', message: 'Intro video URL is required' });
                        hasErrors = true;
                      } else if (!isValidVideoUrl(formValues.introVideoUrl)) {
                        setError('introVideoUrl', {
                          type: 'pattern',
                          message: 'Please enter a valid video URL with supported extensions (.mp4, .webm, .ogg, .mov, .mkv)'
                        });
                        hasErrors = true;
                      }
                    } else if (introVideoSource === 'upload') {
                      // For upload option, validation depends on whether we're editing a course with an existing video
                      const hasExistingUploadedVideo = !isNewCourse && course?.intro_video_url?.includes('/uploads');

                      // Only require a new upload if there's no existing video
                      if (!hasExistingUploadedVideo && !introVideoFile) {
                        setVideoUrlFileError('Please upload an intro video file or switch to URL option');
                        hasErrors = true;
                      } else {
                        setVideoUrlFileError(null);
                      }
                      // If there's an existing video, no validation error - they can proceed without uploading a new one
                    }
                    if (formValues.whatYouWillLearn.length === 0) {
                      setError('whatYouWillLearn', { type: 'required', message: 'Add at least one learning outcome by pressing the Enter key' });
                      hasErrors = true;
                    }
                    if (formValues.requirements.length === 0) {
                      setError('requirements', { type: 'required', message: 'Add at least one requirement by pressing the Enter key' });
                      hasErrors = true;
                    }

                    // Check description field
                    if (formValues.description === "<p><br></p>") {
                      toast.error("Description is required")
                      hasErrors = true;
                    }

                    // Check each field and set error if empty
                    validationFields.forEach(field => {
                      if (!field.value) {
                        setError(field.name as any, { type: 'required', message: field.message });
                        hasErrors = true;
                      }
                    });

                    // Check thumbnail separately as it's not part of the form values
                    if (isNewCourse && !thumbnailFile) {
                      setThumbnailError('Please upload a thumbnail image');
                      hasErrors = true;
                    } else {
                      setThumbnailError(null);
                    }

                    if (hasErrors) {
                      return;
                    }
                  }

                  if (activeStep === 1 && modules.length === 0) {
                    toast.error('Please add at least one module with lessons before proceeding');
                    return;
                  }

                  setActiveStep((prev) => Math.min(2, prev + 1));
                }}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => {
                  console.log('Create/Update Course button clicked directly');
                  // Directly call the onSubmit function with the form values
                  onSubmit(getValues());
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ?
                  <CircularProgress size={24} color="inherit" /> :
                  (isNewCourse ? "Create Course" : "Update Course")}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}