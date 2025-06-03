"use client";

import React from "react";

interface WishlistCardSkeletonProps {
  maxWidth?: string;
}

export default function WishlistCardSkeleton({ maxWidth }: WishlistCardSkeletonProps) {
  return (
    <div className={`${maxWidth} rounded-xl bg-white shadow-sm overflow-hidden m-3 animate-pulse`}>
      {/* Thumbnail placeholder */}
      <div className="relative w-full aspect-[359/154] bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-300"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 20"
          >
            <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z" />
            <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z" />
          </svg>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Difficulty tag placeholder */}
        <div className="h-[25px] w-24 bg-gray-200 rounded-md"></div>
        
        {/* Title and heart icon placeholder */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-full"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="w-[30px] h-[30px] rounded-full bg-gray-200"></div>
        </div>

        {/* Duration and instructor placeholder */}
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        
        {/* Button placeholder */}
        <div className="h-12 bg-gray-200 rounded-md w-full"></div>
      </div>
    </div>
  );
}