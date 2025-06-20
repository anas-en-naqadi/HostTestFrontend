"use client";

import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, LinearProgress, Button, Box, Typography, CircularProgress, Slide } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { CourseSaveEvents } from '@/services/CourseSaveService';
import { useCourseDraftStore } from '@/store/courseDraftStore';
import { useCourseModalStore } from '@/store/courseModalStore';

// Represents the state of the background save operation
interface Status {
  key: string;
  phase: 'upload' | 'processing' | 'success' | 'error';
  progress?: { completed: number; total: number };
}

const CourseStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState('');
  const modalStore = useCourseModalStore();

  useEffect(() => {
    const handleStart = ({ key }: { key: string }) => {
      setStatus({ key, phase: 'upload', progress: { completed: 0, total: 1 } });
      setMessage('Preparing to save...');
    };

    const handleProgress = (progress: { completed: number; total: number }) => {
      setStatus(prev => prev ? { ...prev, phase: 'upload', progress } : null);
      const percent = Math.round((progress.completed / progress.total) * 100);
      setMessage(`Uploading files... ${percent}%`);
    };

    const handleProcessing = ({ key }: { key: string }) => {
      setStatus(prev => prev ? { ...prev, phase: 'processing' } : null);
      setMessage('Finalizing course details...');
    };

    const handleSuccess = () => {
      setStatus(prev => prev ? { ...prev, phase: 'success' } : null);
      setMessage('Course saved successfully!');
      setTimeout(() => setStatus(null), 4000); // Auto-hide on success
    };

    const handleError = ({ key, message }: { key: string; message: string }) => {
      setStatus({ key, phase: 'error' });
      setMessage(message || 'An unexpected error occurred.');
    };

    CourseSaveEvents.on('start', handleStart);
    CourseSaveEvents.on('progress', handleProgress);
    CourseSaveEvents.on('processing', handleProcessing);
    CourseSaveEvents.on('success', handleSuccess);
    CourseSaveEvents.on('error', handleError);

    return () => {
      CourseSaveEvents.off('start', handleStart);
      CourseSaveEvents.off('progress', handleProgress);
      CourseSaveEvents.off('processing', handleProcessing);
      CourseSaveEvents.off('success', handleSuccess);
      CourseSaveEvents.off('error', handleError);
    };
  }, []);

  const handleRetry = () => {
    if (!status?.key) return;

    const courseId = status.key === 'new' ? null : parseInt(status.key, 10);
    
    // Re-open the modal for the user to fix the draft
    modalStore.setCourseId(courseId);
    modalStore.setModalOpen(true);

    // Hide the widget
    setStatus(null);
  };

  const getIcon = () => {
    switch (status?.phase) {
      case 'upload':
      case 'processing':
        return <CircularProgress size={24} sx={{ mr: 1.5 }} />;
      case 'success':
        return <CheckCircleOutlineIcon color="success" sx={{ mr: 1.5, fontSize: 28 }} />;
      case 'error':
        return <ErrorOutlineIcon color="error" sx={{ mr: 1.5, fontSize: 28 }} />;
      default:
        return null;
    }
  };

  return (
    <Snackbar
      open={!!status}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={Slide}
      sx={{ minWidth: 320 }}
    >
      <Alert
        severity={status?.phase === 'error' ? 'error' : status?.phase === 'success' ? 'success' : 'info'}
        icon={false}
        sx={{
          width: '100%',
          boxShadow: 6,
          borderRadius: 2,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        {getIcon()}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {message}
          </Typography>
          {(status?.phase === 'upload' && status.progress) && (
            <LinearProgress
              variant="determinate"
              value={(status.progress.completed / status.progress.total) * 100}
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          )}
          {status?.phase === 'error' && (
            <Button variant="contained" color="error" size="small" sx={{ mt: 1.5, textTransform: 'none' }} onClick={handleRetry}>
              Fix & Retry
            </Button>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default CourseStatusWidget;
