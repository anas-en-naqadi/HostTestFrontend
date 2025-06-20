// utils/navigator.ts
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
// Match Next.js's router.push signature exactly
type NavigateFn = (href: string, options?: NavigateOptions) => void;

let navigator: NavigateFn | null = null;

export const setNavigator = (fn: NavigateFn) => {
  navigator = fn;
};

/**
 * Wrapper to navigate with support for URL objects and params
 */
export function navigate(
  path: string | URL,
  params?: Record<string, string | number>,
  options?: NavigateOptions
) {
  if (!navigator) {
    console.warn("Navigator isn't set yet");
    return;
  }

  // Convert URL object to string if needed
  let urlString = typeof path === 'string' ? path : path.toString();
  
  // Add query params if provided
  if (params && Object.keys(params).length) {
    const search = new URLSearchParams(
      Object.entries(params).reduce<Record<string,string>>(
        (acc, [k,v]) => ({ ...acc, [k]: String(v) }),
        {}
      )
    ).toString();
    urlString += `?${search}`;
  }

  // Call Next.js router.push with the processed string URL
  navigator(urlString, options);
}