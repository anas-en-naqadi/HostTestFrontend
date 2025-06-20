// StatSkeletonCard.jsx
import React from "react";

const StatSkeletonCard = () => {
  // Use smaller radius for better responsiveness
  const radius = 24;
  const strokeWidth = 4;
  const normalizedRadius = radius - strokeWidth * 0.5;
  
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md w-full overflow-hidden">
      <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
        {/* Skeleton Icon */}
        <div className="min-w-[34px] w-[34px] h-[34px] rounded-full bg-gray-200 animate-pulse shrink-0"></div>
        
        {/* Skeleton Text - allow truncation */}
        <div className="h-5 bg-gray-200 rounded w-full max-w-[120px] animate-pulse"></div>
      </div>
      
      {/* Skeleton Progress circle */}
      <div className="relative flex-shrink-0 ml-2">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={2 * Math.PI * normalizedRadius}
            strokeDashoffset={(2 * Math.PI * normalizedRadius) * 0.25}
            className="animate-pulse"
          />
        </svg>
        {/* Value placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default StatSkeletonCard;