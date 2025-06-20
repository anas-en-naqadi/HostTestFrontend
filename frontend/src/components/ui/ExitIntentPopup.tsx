"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, GraduationCap } from 'lucide-react';
import { Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import { usePathname } from "next/navigation";

export const ExitIntentPopup = () => {
  const pathname = usePathname();

  // Define public routes
  const PUBLIC_ROUTES = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/check-email",
  ];

  // Utility to check if current path is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => route === pathname);

  // Static content
  const title = `Advance Your Skills with ${process.env.PLATFORM_NAME || "Forge"}!`;
  const message = `Don't miss out on our expert-led courses, interactive quizzes, and certification opportunities to boost your career.`;
  const ctaText = "Explore Courses";
  const ctaLink = "/courses";
  
  // Configuration
  const delay = 60000; // 1 minute
  const cookieDuration = 3; // 3 days
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [lastShown, setLastShown] = useState<number | null>(null);

  // Check if the popup has been closed before (from localStorage)
  useEffect(() => {
    if (isPublicRoute) return; // Don't show or setup popup on public routes
    const popupClosed = localStorage.getItem('exitIntentPopupClosed');
    const lastShownTime = localStorage.getItem('exitIntentPopupLastShown');
    
    if (popupClosed) {
      const closedDate = new Date(popupClosed);
      const now = new Date();
      const daysSinceClosed = Math.floor((now.getTime() - closedDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysSinceClosed < cookieDuration) {
        // Don't show popup if it was closed within the cookie duration
        return;
      } else {
        // Cookie expired, remove it
        localStorage.removeItem('exitIntentPopupClosed');
      }
    }
    
    if (lastShownTime) {
      setLastShown(parseInt(lastShownTime, 10));
      setHasShown(true);
    }
  }, [cookieDuration, isPublicRoute]);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Only trigger when mouse moves to the top of the page
    if (e.clientY < 50) {
      const now = Date.now();
      
      // Check if we should show the popup based on delay
      if (hasShown && lastShown && now - lastShown < delay) {
        return;
      }
      
      setIsVisible(true);
      setHasShown(true);
      setLastShown(now);
      localStorage.setItem('exitIntentPopupLastShown', now.toString());
    }
  }, [hasShown, lastShown, delay]);

  useEffect(() => {
    if (isPublicRoute) return; // Don't attach event if on public route
    // Add event listener
    document.addEventListener('mousemove', handleMouseLeave);
    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseLeave);
    };
  }, [handleMouseLeave, isPublicRoute]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('exitIntentPopupClosed', new Date().toISOString());
  };

  const handleCTAClick = () => {
    setIsVisible(false);
    // Don't set the closed cookie here so it can show again
  };

  if (isPublicRoute) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md p-8 mx-4 bg-white rounded-xl shadow-2xl border custom-blue-border"
          >
            <button
              onClick={handleClose}
              className="absolute cursor-pointer p-1 text-gray-400 transition-colors rounded-full top-3 right-3 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close popup"
            >
              <X size={20} />
            </button>
            
            <div className="mb-8 text-center">
              <div className="flex justify-center mb-4">
                <GraduationCap size={48} className="custom-blue" />
              </div>
              <h2 className="mb-4 text-2xl font-bold custom-blue">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{message}</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button
                variant="contained"
                className="custom-blue-bg"
                fullWidth
                size="large"
                onClick={handleCTAClick}
                href={ctaLink}
                sx={{ 
                  py: 2, 
                  borderRadius: '8px',
                  textTransform: 'none',
                  backgroundColor:'var(--custom-blue)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'var(--custom-blue-hover)'
                  },
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {ctaText}
              </Button>
              
              <button
                onClick={handleClose}
                className="text-sm cursor-pointer font-medium text-gray-500 transition-colors hover:text-[var(--custom-blue)] mt-2"
              >
                No thanks, I'll pass
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
