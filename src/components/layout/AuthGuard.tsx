'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Spinner from '../common/spinner';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Function to verify if the current path matches a pattern
const matchesPattern = (path: string, patterns: string[]): boolean => {
  return patterns.some(pattern => {
    // Exact match
    if (pattern === path) return true;
    // Pattern with wildcard, e.g. /public/*
    if (pattern.endsWith('/*') && path.startsWith(pattern.slice(0, -2))) return true;
    return false;
  });
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isPublicRoute = matchesPattern(pathname, PUBLIC_ROUTES);

  // Handle authentication checking as soon as component mounts
  useEffect(() => {
    const checkAccess = async () => {
      // For public routes, no auth check needed
      if (isPublicRoute) {
        setIsCheckingAuth(false);
        return;
      }

      // For protected routes, check for token
      if (!accessToken) {
        router.push('/login');
        return;
      }

      // User is authenticated, allow access
      setIsCheckingAuth(false);
    };

    // Small timeout to ensure the auth store is hydrated from localStorage
    // This helps prevent flash redirects on page load
    const timer = setTimeout(() => {
      checkAccess();
    }, 100);

    return () => clearTimeout(timer);
  }, [accessToken, pathname, router, isPublicRoute]);

 
  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}