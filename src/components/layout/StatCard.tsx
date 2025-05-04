import React from "react";
import { IconProps } from "lucide-react";

interface StatCardProps {
  /** Lucide icon component from lucide-react */
  icon: React.FC<IconProps>;
  /** Label below the icon */
  title: string;
  /** Current value */
  value: number;
  /** Maximum value for the progress circle */
  maxValue: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, maxValue }) => {
  // Prevent division by zero
  const percentage = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;

  // Circle parameters
  const radius = 28;
  const strokeWidth = 4;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md w-full">
      <div className="flex items-center gap-3">
        {/* Icon beside text */}
        <Icon size={34} className="text-[#136A86]" />
        
        {/* Text content */}
        <h3 className="text-sm font-medium text-gray-700">
          {title}
        </h3>
      </div>

      {/* Progress circle with value inside */}
      <div className="relative">
        {/* Background Circle */}
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#E5E7EB" /* Tailwind gray-200 */
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle */}
          <circle
            stroke="#136A86" /* Tailwind cyan-800 */
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        {/* Value centered inside circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm lg:text-base font-bold text-[#136A86]">{value}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;