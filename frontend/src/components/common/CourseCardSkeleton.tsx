"use client";

interface CourseCardSkeletonProps {
  showButton?: boolean;
  showProgress?: boolean;
  showLevel?: boolean;
}

export default function CourseCardSkeleton({
  showButton = true,
  showProgress = true,
  showLevel = true,
}: CourseCardSkeletonProps) {
  return (
    <div className="w-full max-w-[500px] h-full flex flex-col rounded-xl bg-white shadow-sm overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="relative h-40 sm:h-[190px] w-full bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-300"
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

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 flex-grow">
        {/* Top Section: level badge, title, subtitle, instructor */}
        <div className="flex flex-col gap-0.5">
          {/* Level badge */}
          {showLevel && (
            <div className="mb-2">
              <div className="h-[25px] w-16 bg-gray-200 rounded-md"></div>
            </div>
          )}

          {/* Title */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
          
          {/* Subtitle */}
          <div className="h-4 bg-gray-200 rounded w-1/2 my-1"></div>
          
          {/* Instructor */}
          <div className="h-3 bg-gray-200 rounded w-1/3 mt-1"></div>
        </div>

        {/* Progress Section */}
        {showProgress && (
          <div className="min-h-[] mt-3 mb-3">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Progress text */}
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              
              {/* Progress bar */}
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="h-2 bg-gray-200 rounded w-full flex-1"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {showButton && (
          <div className="mt-auto">
            <div className="h-10 2xl:h-14 bg-gray-200 rounded w-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}