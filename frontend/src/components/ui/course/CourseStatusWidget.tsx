"use client";

import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, LinearProgress, Button, Box, Typography, CircularProgress, Slide } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { CourseSaveEvents } from '@/services/CourseSaveService';
import { useCourseDraftStore } from '@/store/courseDraftStore';
import { useCourseModalStore } from '@/store/courseModalStore';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { navigate } from '@/lib/utils/navigator';
import { Loader2 } from 'lucide-react';
import { ErrorType, errorMessages } from '@/types/errorMessages';

// Represents the state of the background save operation
const pulseKeyframes = {
  '@keyframes pulse': {
    '0%': { opacity: 0.7 },
    '50%': { opacity: 1 },
    '100%': { opacity: 0.7 },
  },
};

// Represents the state of the background save operation
interface Status {
  key: string;
  phase: 'upload' | 'processing' | 'success' | 'error';
  progress?: CourseSaveEvents['progress'];
  errorType?: ErrorType;
}

const CourseStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState('');
  const modalStore = useCourseModalStore();
  const courseDraftStore = useCourseDraftStore();
  const pathname = usePathname();
  useEffect(() => {
    const handleStart = ({ key }: { key: string }) => {
      setStatus({ key, phase: 'upload', progress: { completed: 1, total: 1 } });
      setMessage('Preparing to save...');
    };

    const handleProgress = (data: CourseSaveEvents['progress']) => {
      setStatus(prev => prev ? { ...prev, phase: 'upload', progress: data } : null);
      setMessage(`Uploading ${data.fileIndex} of ${data.totalFiles}: ${data.file}`);
    };

    const handleProcessing = ({ key }: { key: string }) => {
      setStatus(prev => prev ? { ...prev, phase: 'processing' } : null);
      setMessage('Finalizing course details...');
    };

    const handleSuccess = ({ draft }: any) => {

      setStatus(prev => prev ? { ...prev, phase: 'success' } : null);
      const isUpdate = !!draft?.courseId; // If course has an ID, it's an update
      setMessage(isUpdate ? 'Course updated successfully!' : 'Course created successfully!');
      setTimeout(() => setStatus(null), 4000); // Auto-hide on success
    };

    const handleError = ({ key, message: errorMessage, errorType }: { key: string; message: string; errorType?: ErrorType }) => {
      setStatus({ key, phase: 'error', errorType });
      
      const errorInfo = errorType ? errorMessages[errorType] : errorMessages[ErrorType.UNKNOWN];
      setMessage(errorMessage || errorInfo.message);
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

    const draft = courseDraftStore.getDraft(status.key);
    
    if (draft) {
      const errorInfo = status.errorType ? errorMessages[status.errorType] : errorMessages[ErrorType.UNKNOWN];
      toast.error(`Please reopen the course ${draft.formValues.title} modal to fix the issue.`, {
        position: "top-center",
        description: errorInfo.description
      });
      // Reset the draft by committing it again without submission flag
      courseDraftStore.commitDraft({ ...draft, needsSubmission: false });
      if (!pathname.includes("/courses")) {
        navigate("/instructor/courses");
      }
    }

    // Hide the widget
    setStatus(null);
  };

  const getIcon = () => {
    switch (status?.phase) {
      case 'upload':
        return <UploadFileIcon sx={{ mr: 1, fontSize: 24, color: 'text.secondary' }} />;
      case 'processing':
        return <Loader2 size={20} className='mr-1' />;
      case 'success':
        return <CheckCircleOutlineIcon color="success" sx={{ mr: 1, fontSize: 24 }} />;
      case 'error':
        return <ErrorOutlineIcon color="error" sx={{ mr: 1, fontSize: 24 }} />;
      default:
        return null;
    }
  };

  return (
    <Snackbar
      open={!!status}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={Slide}
      sx={{
        width: 'fit-content',
        maxWidth: '400px',
        minWidth: '300px',
        mr: 2,
        mb: 2,
      }}
    >
      <Alert
        severity={status?.phase === 'error' ? 'error' : status?.phase === 'success' ? 'success' : 'info'}
        icon={false}
        sx={{
          width: 'fit-content',
          maxWidth: '100%',
          minWidth: '300px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          borderRadius: 3,
          p: 2,
          pt: 1.5,
          pb: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: status?.phase === 'upload' && status.progress ? 1.5 : 0,
        }}>
          {getIcon()}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              lineHeight: 1.4,
              color: 'text.primary',
              wordBreak: 'break-word',
              flex: 1,
            }}
          >
            {message}
          </Typography>
        </Box>

        {(status?.phase === 'upload' && status.progress) && (
          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={status.progress.total > 0 ? (status.progress.completed / status.progress.total) * 100 : 0}
              sx={{
                ...pulseKeyframes,
                height: 6,
                borderRadius: 3,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  animation: 'pulse 2s infinite ease-in-out',
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'right',
                mt: 0.75,
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              {status.progress.total > 0 ? `${Math.round((status.progress.completed / status.progress.total) * 100)}%` : 'Preparing...'}
            </Typography>
          </Box>
        )}
        {status?.phase === 'error' && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}
        {status?.phase === 'error' && (
          <Button
            variant="contained"
            color="error"
            size="small"
            fullWidth
            sx={{
              mt: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              py: 1,
              fontSize: '0.8125rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
              },
            }}
            onClick={handleRetry}
          >
            Fix & Retry
          </Button>
        )}
      </Alert>
    </Snackbar>
  );
};

export default CourseStatusWidget;