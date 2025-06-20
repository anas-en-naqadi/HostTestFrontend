"use client";

import Avatar from "react-avatar";
import { Home, Heart } from "lucide-react";
import Link from "next/link";

type CourseHeaderProps = {
  userName: string;
  pageTitle: string;
  canBeShowed: boolean;
  courseProgress: number;
};

export default function CourseHeader({
  userName,
  pageTitle,
  canBeShowed,
  courseProgress,
}: CourseHeaderProps) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${
    (courseProgress / 100) * circumference
  } ${circumference}`;

  return (
    <>
      <style>{`
        .progress-circle {
          position: relative;
          width: 28px;
          height: 28px;
        }
        
        @media (min-width: 640px) {
          .progress-circle {
            width: 32px;
            height: 32px;
          }
        }
        
        @media (min-width: 768px) {
          .progress-circle {
            width: 36px;
            height: 36px;
          }
        }

        .progress-circle svg {
          width: 100%;
          height: 100%;
        }

        .progress-circle-bg {
          fill: none;
          stroke: #e6e6e6;
          stroke-width: 4;
        }

        .progress-circle-fill {
          fill: none;
          stroke: #136A86;
          stroke-width: 4;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
          transition: stroke-dasharray 0.3s ease;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: bold;
          color: #136A86;
        }
        
       
      `}</style>
      <header className="flex flex-col sm:flex-row my-4 sm:my-6 md:my-8 lg:my-10 justify-between gap-4 sm:gap-6 md:gap-8 lg:gap-14 items-center w-full px-4 sm:px-0">
        <div className="w-full sm:max-w-fit">
          <h1 className="uppercase ml-10 md:ml-0 font-semibold font-lora text-[#136A86] text-base sm:text-lg md:text-xl lg:text-[30px] text-center sm:text-left">
            {pageTitle}
          </h1>
        </div>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-14">
          <div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-8 w-full sm:w-auto px-2 sm:px-0 lg:max-w-[42.4rem] items-center justify-center sm:justify-end relative">
            <Link
              href="/intern/home"
              className="text-gray-500 hover:text-[#136A86]"
            >
              <Home size={25} className="sm:w-6 sm:h-6" />
            </Link>

            {/* Progress Circle */}
            <div className="progress-circle mx-1 sm:mx-2 w-[22px]">
              <svg viewBox="0 0 36 36">
                <circle
                  className="progress-circle-bg"
                  cx="18"
                  cy="18"
                  r={radius}
                />
                <circle
                  className="progress-circle-fill"
                  cx="18"
                  cy="18"
                  r={radius}
                  strokeDasharray={strokeDasharray}
                />
              </svg>
              <span
                className={`progress-text ${
                  courseProgress === 100
                    ? "text-[8px]"
                    : "text-[8px] sm:text-[9px] md:text-[10px]"
                }`}
              >
                {courseProgress}%
              </span>
            </div>

            <Link
              href="/intern/wishlist"
              className="text-gray-500 hover:text-[#136A86]"
            >
              <Heart
                size={25}
                className={`sm:w-6 sm:h-6
                   hover:text-red-600 hover:fill-red-600 text-gray-400
                `}
              />
            </Link>
            <Link href="/intern/profile">
              <Avatar
                name={userName}
                round
                size="48"
                className="font-lora font-semibold hidden sm:block sm:w-10 sm:h-10 md:w-12 md:h-12 hover:cursor-pointer"
                textSizeRatio={2.5}
              />
            </Link>
          </div>
        </div>
      </header>
      {canBeShowed && (
        <hr className="text-[#136A86] w-[94%] mx-auto lg:w-full" />
      )}
    </>
  );
}
