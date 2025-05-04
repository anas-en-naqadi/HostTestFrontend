"use client";

import Image from "next/image";
import ProgressBar from "./progress";
import { Check } from "lucide-react";
import { useState } from "react";

interface CourseCardProps {
  title: string;
  subTitle?: string;
  instructor: string;
  image: string;
  progress?: number;
  lessonsCompleted?: string;
  completed?: boolean;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  onAction?: () => void;
  actionLabel: string;
  level?: string;
  duration?: string;
}

export default function CourseCard({
  title,
  subTitle,
  instructor,
  image,
  progress,
  lessonsCompleted,
  completed,
  onAction,
  actionLabel,
  level,
  // duration,
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full max-w-full h-full sm:h-[] flex flex-col rounded-xl bg-white shadow-sm overflow-hidden">
      <div
        className="relative h-40 sm:h-[190px] w-full overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onAction}
      >
        {/* Course thumbnail */}
        <Image
          src={image}
          alt={title}
          fill
          className={`object-cover z-0 transition-transform duration-300 ${
            isHovered ? "scale-120" : "scale-100"
          }`}
        />

        {/* Dark overlay that appears on hover */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isHovered ? "bg-black/50" : "bg-opacity-0"
          }`}
        ></div>

        {/* Hover overlay with play/replay icon */}
        {isHovered && (
          <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center z-10 transition-opacity duration-300 cursor-pointer">
            {completed ? (
              <Image
                src="/replay.svg"
                alt="replay icon"
                width={48}
                height={48}
                className="transform scale-75 hover:scale-100 transition-all duration-300"
              />
            ) : (
              <Image
                src="/play.svg"
                alt="play icon"
                width={48}
                height={48}
                className="transform scale-75 hover:scale-100 transition-all duration-300"
              />
            )}
          </div>
        )}

       
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 flex-grow">
        {/* Top Section: title, instructor, level, duration */}
        <div className="min-h-[] flex flex-col gap-0.5">
          {level && (
             <div className="border border-[#136A86] rounded-md max-w-fit h-[25px] px-2 flex gap-2 items-center mb-2">
             <Image
               src="/network-signal.svg"
               alt="network signal"
               width={9}
               height={9}
             />
             <span className="text-xs font-semibold text-[#136A86]">{level}</span>
           </div>
          )}
          <h1 className="font-bold text-base sm:text-[20px] text-[#111111] line-clamp-2">
            {title}
          </h1>
          <p className="flex items-center gap-2 text-black text-sm my-1">
            {subTitle}
          </p>
          <div className="flex items-center gap-2 text-[#8C8FA5] text-xs mt-1">
            <span>{instructor}</span>
            {/* {duration && (
              <>
                <span>|</span>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{duration}</span>
                </div>
              </>
            )} */}
          </div>
        </div>

        {/* Progress or Completed Section */}
        <div className="min-h-[] mt-3 mb-3">
          {progress !== undefined && lessonsCompleted && (
            <div className="text-[12px] text-[#000000] flex flex-col gap-3 sm:gap-4">
              {completed ? (
                <div className="gap-6 mb-2 mt-4">
                  <p className="text-sm sm:text-[16px] text-[#0E8547] flex items-center gap-2">
                    <span className="text-[#0E8547]">
                      <Check size={16} />
                    </span>{" "}
                    Completed
                  </p>
                </div>
              ) : (
                <>
                  <span className="text-xs">
                    Your progress: <b>{lessonsCompleted}</b>
                  </span>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex-1">
                      <ProgressBar value={progress} />
                    </div>
                    <span className="text-[#136A86] text-xs font-sans font-semibold">
                      {progress}%
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <button
            onClick={onAction}
            className="w-full bg-[#136A86] hover:bg-[#5CB5BD] cursor-pointer text-white text-sm sm:text-[16px] uppercase py-2 2xl:p-4 rounded-md hover:bg-opacity-90 transition"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
