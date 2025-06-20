/*
 * CourseSaveService
 * -----------------
 * Listens to `useCourseDraftStore` for drafts that are marked for submission
 * (`needsSubmission: true`) and performs a two-phase persistence:
 *   1. Upload all referenced files (thumbnail, intro video, lesson videos) with
 *      chunked + retried uploads using the backend `/uploads` endpoint.
 *   2. Submit the cleaned JSON payload to the main course endpoint (create or
 *      update), replacing file references with their final URLs.
 *
 * This service is triggered only when a draft is committed with the `submit: true` option.
 */

import { AxiosError } from 'axios';
import axiosClient from '@/lib/axios';
import mitt from 'mitt';
import { useCourseDraftStore, CourseDraft } from '@/store/courseDraftStore';
import { ApiCourseResponse } from '@/store/courseModalStore';
import { QueryClient } from '@tanstack/react-query';
import { ErrorType } from '@/types/errorMessages';

// ---------------------------------------
// Helper types & constants
// ---------------------------------------

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

export type CourseSaveEvents = {
  start: { key: string };
  progress: {
    file: string;
    fileIndex: number;
    totalFiles: number;
    completed: number;
    total: number;
  };
  processing: { key: string };
  success: { response: ApiCourseResponse };
  error: { key: string; message: string; errorType: ErrorType };
};

export const eventEmitter = mitt<CourseSaveEvents>();

export const CourseSaveEvents = {
  emit: {
    start: (key: string) => {
      eventEmitter.emit('start', { key });
    },
    progress: (data: {
      file: string;
      fileIndex: number;
      totalFiles: number;
      completed: number;
      total: number;
    }) => {
      eventEmitter.emit('progress', data);
    },
    processing: (key: string) => {
      eventEmitter.emit('processing', { key });
    },
    success: (response: any) => {
      eventEmitter.emit('success', { response });
    },
    error: (key: string, message: string, errorType: ErrorType = ErrorType.UNKNOWN) => {
      eventEmitter.emit('error', { key, message, errorType });
    }
  },
  on: (event: string, callback: (...args: any[]) => void) => {
    return eventEmitter.on(event, callback);
  },
  off: (event: string, callback: (...args: any[]) => void) => {
    eventEmitter.off(event, callback);
  }
};

// ---------------------------------------
// Service implementation
// ---------------------------------------

let serviceStarted = false;
let currentlyProcessing = new Set<string>(); // Tracks keys of drafts being processed
let globalQueryClient: QueryClient | null = null;

export function startCourseSaveService(queryClient:QueryClient) {
  if (serviceStarted) return; // singleton
  serviceStarted = true;

  globalQueryClient = queryClient;

  useCourseDraftStore.subscribe(async (state) => {
    for (const key in state.drafts) {
      const draft = state.drafts[key];
      // Check if the draft is marked for submission and not already being processed.
      if (draft.needsSubmission && !state.isProcessing[key] && !currentlyProcessing.has(key)) {
        const courseId = draft.courseId;

        // Mark as processing and notify UI
        currentlyProcessing.add(key);
        useCourseDraftStore.getState().setProcessing(courseId, true);
        CourseSaveEvents.emit.start(key);

        try {
          const payloadWithUrls = await processDraft(draft);

          CourseSaveEvents.emit.processing(key);

          const response = await submitFinalPayload(payloadWithUrls);

          CourseSaveEvents.emit.success(payloadWithUrls);
          useCourseDraftStore.getState().clearDraft(courseId);
          if (globalQueryClient) {
            await globalQueryClient.invalidateQueries({ queryKey: ['userCourses'] });
            console.log("Successfully invalidated userCourses cache");
          }
        } catch (err) {
          const message = err instanceof AxiosError ? err.response?.data?.message ?? err.message : (err as Error).message ?? 'Unknown error';
          console.error(`CourseSaveService error for draft ${key}:`, err);
          if (err instanceof AxiosError) {
            CourseSaveEvents.emit.error(key, message, ErrorType.NETWORK);
          } else {
            CourseSaveEvents.emit.error(key, message, ErrorType.UNKNOWN);
          }
          // On error, we reset the processing flag but keep `needsSubmission` as true
          // so the user can retry from the widget.
          useCourseDraftStore.getState().setProcessing(courseId, false);
        } finally {
          // Release the processing lock
          currentlyProcessing.delete(key);
        }
      }
    }
  });
}

// ---------------------------------------
// Draft processing helpers
// ---------------------------------------

// Convert a string to a URL-friendly slug (very simple impl.)
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^a-z0-9\-]/g, '') // Remove invalid chars
    .replace(/\-+/g, '-')        // Collapse dups
    .replace(/^\-+|\-+$/g, '');
}

async function processDraft(draft: CourseDraft) {
  const cloned = structuredClone(draft);
  const form = cloned.formValues;
  const courseSlug = form.title ? slugify(form.title) : '';

  const filesToUpload: {
    file: File;
    purpose: 'thumbnail' | 'intro_video' | 'lesson_video';
    updateUrlInDraft: (url: string) => void;
    displayName: string;
  }[] = [];

  if (cloned.thumbnailFile instanceof File) {
    filesToUpload.push({
      file: cloned.thumbnailFile,
      purpose: 'thumbnail',
      updateUrlInDraft: (url) => { form.thumbnailUrl = url; },
      displayName: 'Course Thumbnail'
    });
  }

  if (cloned.introVideoFile instanceof File) {
    filesToUpload.push({
      file: cloned.introVideoFile,
      purpose: 'intro_video',
      updateUrlInDraft: (url) => { form.introVideoUrl = url; },
      displayName: 'Introduction Video'
    });
  }

  (cloned.modules || []).forEach((mod: any) => {
    (mod.lessons || []).forEach((lesson: any) => {
      if (lesson.uploaded_video_file instanceof File) {
        filesToUpload.push({
          file: lesson.uploaded_video_file,
          purpose: 'lesson_video',
          updateUrlInDraft: (url) => { lesson.video_url = url; },
          displayName: `Lesson: ${lesson.title.toUpperCase() || 'Untitled'} video file`
        });
      }
    });
  });

  const totalFiles = filesToUpload.length;
  for (let i = 0; i < totalFiles; i++) {
    const { file, purpose, updateUrlInDraft, displayName } = filesToUpload[i];

    // Emit progress update for the new file
    CourseSaveEvents.emit.progress({
      file: displayName,
      fileIndex: i + 1,
      totalFiles,
      completed: 1, // Start at 1% instead of 0%
      total: 100
    });

    const url = await uploadFileWithRetry(file, purpose, courseSlug, displayName, i + 1, totalFiles);
    updateUrlInDraft(url);

    // Add a small delay before moving to the next file
    await delay(500);
  }

  const modulesForApi = (cloned.modules || []).map((mod: any, modIdx: number) => ({
    ...(mod.id ? { id: mod.id } : {}),
    title: mod.title,
    order_position: modIdx + 1,
    lessons: (mod.lessons || []).map((lesson: any, lessonIdx: number) => {
      const durationInMinutes = parseFloat(lesson.durationMinutes || '0');
      const durationInSeconds = Math.round(durationInMinutes * 60);
      return {
        ...(lesson.id ? { id: lesson.id } : {}),
        title: lesson.title,
        content_type: lesson.contentType,
        video_url: lesson.contentType === 'video' ? lesson.video_url ?? '' : undefined,
        lesson_text: lesson.contentType === 'text' ? lesson.lesson_text ?? '' : undefined,
        quiz_id: lesson.contentType === 'quiz' ? lesson.quiz_id ?? null : undefined,
        duration: durationInSeconds,
        order_position: lessonIdx + 1,
        is_final_quiz: !!lesson.isFinalQuiz,
      };
    })
  }));

  return {
    courseId: cloned.courseId,
    title: form.title,
    subtitle: form.subtitle,
    description: form.description,
    difficulty: form.difficulty,
    category_id: form.categoryId,
    instructor_id: cloned.instructor_id,
    is_published: form.isPublished,
    slug: courseSlug,
    thumbnail_url: form.thumbnailUrl ?? undefined,
    intro_video_url: form.introVideoUrl ?? undefined,
    what_you_will_learn: form.whatYouWillLearn ?? [],
    course_requirements: form.requirements ?? [],
    modules: modulesForApi,
  };
}

async function uploadFileWithRetry(
  file: File,
  purpose: string,
  courseSlug: string,
  displayName: string,
  fileIndex: number,
  totalFiles: number
): Promise<string> {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      // All files, regardless of size, use the chunking mechanism.
      return await uploadInChunks(file, purpose, courseSlug, displayName, fileIndex, totalFiles);
    } catch (err) {
      attempt += 1;
      console.warn(`Upload attempt ${attempt} failed for ${file.name}. Retrying...`, err);
      if (attempt >= MAX_RETRIES) {
        throw new Error(`Upload failed for file ${file.name} after ${MAX_RETRIES} attempts.`);
      }
      await delay(RETRY_DELAY_MS * attempt);
    }
  }
  throw new Error(`Upload failed for file ${file.name}.`); // Should be unreachable
}

async function uploadInChunks(
  file: File,
  purpose: string,
  courseSlug: string,
  displayName: string,
  fileIndex: number,
  totalFiles: number
): Promise<string> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  const payload: {
    fileName: string;
    totalChunks: number;
    purpose: string;
    courseSlug?: string;
  } = {
    fileName: file.name,
    totalChunks,
    purpose,
  };

  if (purpose === 'lesson_video' && courseSlug) {
    payload.courseSlug = courseSlug;
  }

  const fileIdRes = await axiosClient.post(`/uploads/initiate`, payload);
  const uploadId = fileIdRes.data.uploadId as string;

  if (!uploadId) {
    throw new Error('Failed to initiate upload session.');
  }

  for (let index = 0; index < totalChunks; index++) {
    const start = index * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const blob = file.slice(start, end);

    const form = new FormData();
    form.append('chunk', blob, file.name);
    form.append('uploadId', uploadId);
    form.append('chunkIndex', index.toString());

    await axiosClient.post(`/uploads/chunk`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    CourseSaveEvents.emit.progress({
      file: displayName,
      fileIndex: fileIndex,
      totalFiles: totalFiles,
      completed: index + 1,
      total: totalChunks
    });
  }

  const finishRes = await axiosClient.post(`/uploads/complete`, { uploadId });
  console.log("url", finishRes.data);
  return finishRes.data.url as string;
}

async function submitFinalPayload(cleanPayload: any) {
  // Decide between create/update depending on presence of courseId
  // throw new Error('Test error - simulated error for testing');
  if (cleanPayload.courseId) {
    const { data } = await axiosClient.put(`/courses/${cleanPayload.slug}`, cleanPayload);
    return data as ApiCourseResponse;
  }
  const { data } = await axiosClient.post(`/courses`, cleanPayload);
  return data as ApiCourseResponse;
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
