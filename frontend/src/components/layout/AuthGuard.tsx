"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Spinner from "../common/spinner";
import { useAuthStore } from "@/store/authStore";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/check-email",
];

const SERVER_CODE_STATUS_ROUTES = [
  "/not-found",
  "/server-error",
  "/too-many-request",
];

// Function to verify if the current path matches a pattern
const matchesPattern = (path: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => {
    // Exact match
    if (pattern === path) return true;
    // Pattern with wildcard, e.g. /public/*
    if (pattern.endsWith("/*") && path.startsWith(pattern.slice(0, -2)))
      return true;
    return false;
  });
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<{user: {role: string} | null} | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isPublicRoute = matchesPattern(pathname, PUBLIC_ROUTES);
  const isServerCodeRoutes = matchesPattern(
    pathname,
    SERVER_CODE_STATUS_ROUTES
  );

  // Get session data and handle authentication in a single useEffect
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get auth state using the store
        const authState = useAuthStore.getState();
        const token = authState.getToken();
        const parsedSession = { user: authState.user };
        
        setSession(parsedSession);
        setHasToken(!!token);
        
        // Root path handling
        if (pathname === "/") {
          if (!token) {
            router.replace("/login");
            return;
          } else {
            // Redirect to role-based dashboard if role exists, else generic dashboard
            if (parsedSession?.user?.role) {
              router.replace(`/${parsedSession.user.role}/dashboard`);
            } 
            return;
          }
        }

        // PUBLIC ROUTE handling
        if (isPublicRoute) {
          if (token && parsedSession?.user?.role) {
            router.replace(`/${parsedSession.user.role}/dashboard`);
          }
          setIsCheckingAuth(false);
          return;
        }
        
        // Server code routes don't need authentication
        if (isServerCodeRoutes) {
          setIsCheckingAuth(false);
          return;
        }
        
        // For protected routes, check for token and redirect if not authenticated
        if (!token) {
          console.log('No auth token found, redirecting to login');
          router.push("/login");
          return;
        }
        
        // User is authenticated, allow access to protected route
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Error during authentication check:', error);
        // Redirect to login on error for protected routes
        if (!isPublicRoute && !isServerCodeRoutes) {
          router.push("/login");
        } else {
          setIsCheckingAuth(false);
        }
      }
    };
    
    // Small delay to ensure router is ready
    const timer = setTimeout(() => {
      checkAuth();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [pathname, router, isPublicRoute, isServerCodeRoutes]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}