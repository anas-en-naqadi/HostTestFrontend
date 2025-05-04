"use client";

import Image from "next/image";
import { Heart, Clock, Languages, Calendar, User } from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { useEffect, useState } from "react";
import { addToWishlist, removeFromWishlist } from "@/lib/api/wishlists";
import { useRouter } from "next/navigation";
// import axios, { AxiosError } from "axios";
// import { CourseResponse } from "@/types/course.types";

interface CourseCardData {
  id?: number;
  slug: string;
  thumbnail_url: string;
  title: string;
  subtitle?: string;
  difficulty?: string;
  totalDuration?: number;
  updated_at: string;
  enrollmentsCount?: number;
  instructorName?: string;
  isInWishList: boolean;
  category?: string;
}

interface HomeCourseCardProps {
  course: CourseCardData;
  onRemove?: (courseId: number) => void;
  onAdd?: (courseId: number) => void;
}

export default function HomeCourseCard({
  course,
  onRemove,
  onAdd,
}: HomeCourseCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [localIsInWishlist, setLocalIsInWishlist] = useState(
    course.isInWishList
  );

  // Sync with prop changes
  useEffect(() => {
    setLocalIsInWishlist(course.isInWishList);
  }, [course.isInWishList]);

  async function handleHeartClick() {
    if (isLoading || !course.id) return;

    try {
      setIsLoading(true);
      // Optimistic update
      setLocalIsInWishlist(!localIsInWishlist);

      if (localIsInWishlist) {
        const success = await removeFromWishlist({
          course_id: course.id,
          main_course_id: null,
        });
        if (success && onRemove) {
          onRemove(course.id);
        } else {
          // Revert if failed
          setLocalIsInWishlist(true);
        }
      } else {
        const success = await addToWishlist({
          course_id: course.id,
          main_course_id: null,
        });
        if (success && onAdd) {
          onAdd(course.id);
        } else {
          // Revert if failed
          setLocalIsInWishlist(false);
        }
      }
    } catch (error) {
      // Revert on error
      setLocalIsInWishlist(localIsInWishlist);
      console.error("Error handling wishlist action:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-full h-full flex flex-col xl:flex-row rounded-xl bg-white shadow-lg overflow-hidden">
      {/* Course thumbnail */}
      <div className="relative h-[180px] sm:h-[200px] xl:h-auto flex-shrink-0 sm:w-full xl:w-[393px] bg-gray-100">
        <Image
          src={course.thumbnail_url}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 300px, 350px"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/fallback-image.jpg";
          }}
        />
      </div>

      {/* Content Area */}
      <div className="relative flex flex-col justify-between p-4 sm:p-5 flex-grow">
        {/* Heart Icon */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <Heart
            size={28}
            onClick={handleHeartClick}
            className={`cursor-pointer ${
              localIsInWishlist ? "text-red-600 fill-red-600" : "text-gray-400"
            } transition-all duration-300`}
          />
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-2">
          {course.difficulty && (
            <div className="border border-[#136A86] rounded-md px-2 py-0.5 inline-flex items-center gap-2 mb-1 w-fit">
              <Image
                src="/network-signal.svg"
                alt="difficulty"
                width={10}
                height={10}
              />
              <span className="text-xs font-semibold text-[#136A86] capitalize">
                {course.difficulty}
              </span>
            </div>
          )}

          <h1 className="text-lg md:text-xl font-bold text-[#111] line-clamp-2 pr-10 sm:pr-0">
            {course.title}
          </h1>

          {course.subtitle && (
            <p className="text-sm text-black line-clamp-2">{course.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center text-xs text-[#8C8FA5] gap-2 mt-2">
            {course.totalDuration && (
              <>
                <div className="flex items-center gap-1">
                  <Clock size={12} color="#136A86" />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
                <span>|</span>
              </>
            )}
            <div className="flex items-center gap-1">
              <Languages size={12} className="text-[#5CB5BD]" />
              <span>English</span>
            </div>
            <span>|</span>
            <div className="flex items-center gap-1">
              <Calendar size={12} className="text-[#5CB5BD]" />
              <span>
                Last Updated {new Date(course.updated_at).toLocaleDateString()}
              </span>
            </div>
            <span>|</span>
            <div className="flex items-center gap-1">
              <User size={12} className="text-[#5CB5BD]" />
              <span>{course.enrollmentsCount ?? 0} interns</span>
            </div>
          </div>
        </div>

        {/* Footer section */}
        <div className="mt-4 sm:mt-6">
          {/* Instructor line */}
          <div className="text-sm text-[#136A86] mb-3">
            <span>
              Created by <b>{course.instructorName ?? "Instructor"}</b>
            </span>
          </div>

          {/* Category and Button Container */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
            {course.category && (
              <div className="inline-flex items-center px-3 py-1.5 bg-[#5CB5BD] text-white text-xs rounded-lg">
                {course.category}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => router.push(`/intern/course/${course.slug}`)}
              className="w-full sm:w-auto bg-[#136A86] hover:bg-[#5CB5BD] text-white text-sm sm:text-base uppercase py-2.5 px-4 sm:py-3 sm:px-6 font-semibold rounded-md transition cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}