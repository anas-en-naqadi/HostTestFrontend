'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchProvider } from '@/contexts/SearchContext';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchProvider>
        {children}
      </SearchProvider>
    </QueryClientProvider>
  );
}
