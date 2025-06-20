import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  label: string;
  isForEnrollment:boolean;
  color?: string;
  bgColor?: string;
}

export default function StatCard({
  title,
  value,
  label,
  color = "#1B7F9E",
  bgColor = "#EAF6FA",
  isForEnrollment
}: StatCardProps) {

     // Default targets if not provided
  const enrollmentTarget = 10; // Example: 10 enrollments/day is 100%
  const completionTarget =  5;  // Example: 5 completions/day is 100%

  // Calculate percentages based on daily targets
  const enrollmentPercent = Math.min(100, Math.round((value / enrollmentTarget) * 100));
  const completionPercent = Math.min(100, Math.round((value/ completionTarget) * 100));

  // Circle settings
  const size = 161;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (isForEnrollment ? enrollmentPercent : completionPercent  / 100) * circumference;

  return (
    <div className="bg-white p-5 flex flex-col font-sans justify-around rounded-lg shadow-sm w-full ">
      <h3 className="text-[#136A86] font-bold text-lg  text-center">{title}</h3>
      
      <div className="flex justify-center">
        <div className="relative flex items-center justify-center w-28 h-28">
          {/* Background circle */}
          <svg width={size} height={size} className="absolute">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={bgColor}
              strokeWidth={strokeWidth}
            />
          </svg>
          
          {/* Foreground circle */}
          <svg width={size} height={size} className="absolute transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Value and label */}
          <div className="flex flex-col items-center">
            <span className="text-[40px] font-bold ">{value}</span>
            <span className="text-[#A3A3A3] text-sm  -mt-1">{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}