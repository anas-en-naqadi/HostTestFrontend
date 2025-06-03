"use client";

export default function HomeCourseCardSkeleton() {
  return (
    <div className="w-full max-w-full h-full flex flex-col xl:flex-row rounded-xl bg-white shadow-lg overflow-hidden animate-pulse">
      {/* Course thumbnail skeleton */}
      <div className="relative h-[200px] xl:h-auto flex-shrink-0 sm:w-full xl:w-[393px] bg-gray-200">
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

      {/* Content Area skeleton */}
      <div className="relative flex flex-col justify-between p-4 sm:p-5 flex-grow">
        {/* Heart Icon placeholder */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <div className="w-7 h-7 rounded-full bg-gray-200"></div>
        </div>

        {/* Main content skeleton */}
        <div className="flex flex-col gap-2">
          {/* Difficulty tag placeholder */}
          <div className="w-24 h-6 bg-gray-200 rounded-md mb-1"></div>

          {/* Title placeholder */}
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>

          {/* Subtitle placeholder */}
          <div className="h-4 bg-gray-200 rounded w-full mt-1"></div>

          {/* Course info placeholder */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-1 mx-1"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-1 mx-1"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-1 mx-1"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Footer section skeleton */}
        <div className="mt-auto">
          {/* Instructor line placeholder */}
          <div className="h-4 bg-gray-200 rounded w-48 mt-2"></div>

          {/* Category and Button Container */}
          <div className="flex justify-between items-center mt-4">
            {/* Category placeholder */}
            <div className="w-20 h-6 bg-gray-200 rounded-lg"></div>

            {/* Action Button placeholder */}
            <div className="w-32 h-10 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}