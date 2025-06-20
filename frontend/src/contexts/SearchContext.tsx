"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  globalSearchQuery: '',
  setGlobalSearchQuery: () => {},
});

export const useSearchContext = () => useContext(SearchContext);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  return (
    <SearchContext.Provider
      value={{
        globalSearchQuery,
        setGlobalSearchQuery,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
