"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { startCourseSaveService } from '@/services/CourseSaveService';

/**
 * This component is responsible for initializing client-side services that need to run
 * once when the application loads. It renders nothing to the DOM.
 */
export default function AppInitializer() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Starts the background service that listens for course draft commits
    // and handles the upload and submission process.
    startCourseSaveService(queryClient);
  }, [queryClient]);

  return null;
}