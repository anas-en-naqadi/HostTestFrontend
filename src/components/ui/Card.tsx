import Image from "next/image";
import ProgressBar from "./progress";
import { Check } from "lucide-react";
import Link from "next/link";

import { Enrollment } from "@/types/course.types";

interface CourseCardProps {
  enrollment: Enrollment;
}

export default function CourseCard({ enrollment }: CourseCardProps) {
  return (
    <div className="w-full h-full rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="relative w-full aspect-video overflow-hidden">
        {/* Hover overlay with play button */}
        <Link href={`/intern/course/${enrollment.courseSlug}/learn`}>
          <div className="absolute inset-0 bg-black/0 hover:bg-black/50 flex items-center justify-center z-10 transition-all duration-300 opacity-0 hover:opacity-100">
            <Image
              src="/play.svg"
              alt="play icon"
              width={48}
              height={48}
              className="transform scale-75 hover:scale-100 transition-all duration-300"
            />
          </div>
        </Link>

        {/* enrollment thumbnail */}
        <Image
          src={enrollment.courseThumbnail}
          alt={enrollment.courseTitle}
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-grow">
        {/* enrollment title and instructor */}
        <div>
          <h1 className="font-semibold text-base text-gray-800 line-clamp-2">
            {enrollment.courseTitle}
          </h1>
          <span className="text-gray-500 text-xs">{enrollment.instructorName}</span>
        </div>

        {/* Progress information */}
        <div className="mt-auto">
          {enrollment.progressPercent !== 100 ? (
            <div className="flex flex-col gap-3">
              <span className="text-xs">
                Your progress: <b>{enrollment.completedLessons} of {enrollment.totalLessons} lessons completed</b>
              </span>

              {/* Progress bar */}
              <div className="flex items-center gap-3 w-full">
                <ProgressBar value={enrollment.progressPercent} />
                <span className="text-cyan-700 text-xs font-sans font-semibold whitespace-nowrap">
                  {enrollment.progressPercent + '%'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
            <span className="text-green-700 flex items-center gap-1 text-sm font-bold">
              <Check height={16} width={16} strokeWidth={3} />
              Completed
            </span>
            <div className="flex items-center gap-3 w-full">
                <ProgressBar value={100} color="bg-green-700" />
                <span className="text-green-700 text-xs font-sans font-semibold whitespace-nowrap">
                  {enrollment.progressPercent + '%'}
                </span>
              </div>
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
}
