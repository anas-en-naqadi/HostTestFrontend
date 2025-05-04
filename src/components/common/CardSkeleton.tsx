"use client";
interface CardSkeletonProps {
  showButton?: boolean;
}
export default function CardSkeleton({showButton= false}: CardSkeletonProps){
    return (
        <div
        className="w-sm sm:w-md md:w-lg lg:w-[393px] max-h-fit rounded-xl bg-white shadow-sm overflow-hidden m-3 animate-pulse"
      >
        {/* Image placeholder */}
        <div className="relative h-44 sm:h-48 md:h-[180px] w-full bg-gray-200">
          {/* play-button overlay placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-200 dark:text-gray-600"
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

        {/* Content placeholder */}
        <div className="p-5 flex flex-col gap-4">
          {/* Title + instructor */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Progress block */}
          <div className="space-y-3">
            {/* text line */}
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            {/* progress bar */}
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>

           {/* Optional Button */}
        {showButton && (
          <div className="mt-4 flex justify-end">
            <div className="h-12 bg-gray-200 rounded w-full "></div>
          </div>
        )}
        </div>
      </div>
    )
}