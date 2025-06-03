import Image from "next/image";
import { Heart, Clock, Loader2 } from "lucide-react";
import { CourseCardData } from "@/types/course.types";
import { useEffect, useState } from "react";
import { formatDuration } from "@/utils/formatDuration";
// import { toast } from "react-toastify";
import { addToWishlist, removeFromWishlist } from "@/lib/api/wishlists";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { useClearDashboardCache } from "@/lib/hooks/useClearDashboardCache";
import { NetworkSignal } from "../common/networkSignal";
interface WishListCardProps {
  maxWidth?: string;
  course: CourseCardData;
  height?: string;
  onRemove?: (courseId: number) => void;
  onAdd?: (courseId: number) => void;
  mainCourseId?: number | null;
}

interface ErrorResponse {
  message?: string;
}

export default function WishListCard({
  maxWidth,
  course,
  onRemove,
  height = "h-[368px]",
  onAdd,
  mainCourseId = null,
}: WishListCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(course.isInWishList);
  // const [isRemoving, setIsRemoving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const clearDashboardCache = useClearDashboardCache();
  useEffect(() => {
    setIsInWishlist(course.isInWishList);
  }, [course]);
  async function handleHeartClick() {
    if (isLoading || !course.id) return;

    try {
      setIsLoading(true);

      if (isInWishlist) {
        // Remove from wishlist
        const success = await removeFromWishlist({
          course_id: course.id,
          main_course_id: mainCourseId,
        });
        if (success) {
          clearDashboardCache();
          setIsInWishlist(false);

          onRemove?.(course.id);
        }
      } else {
        // Add to wishlist
        try {
          const success = await addToWishlist({
            course_id: course.id,
            main_course_id: mainCourseId,
          });

          if (success) {
            clearDashboardCache();

            setIsInWishlist(true);

            onAdd?.(course.id);
          }
        } catch (addError) {
          // Check if it's an Axios error
          if (axios.isAxiosError(addError)) {
            const axiosError = addError as AxiosError<ErrorResponse>;
            const errorMessage = axiosError.response?.data?.message || "";

            if (
              errorMessage.includes("already in wishlist") ||
              axiosError.message.includes("already in wishlist")
            ) {
              // If course is already in wishlist, consider it as success
              setIsInWishlist(true);
              onAdd?.(course.id);
            } else {
              // Re-throw for other axios errors
              throw addError;
            }
          } else if (
            addError instanceof Error &&
            addError.message.includes("already in wishlist")
          ) {
            // Handle non-axios errors with 'already in wishlist' message
            setIsInWishlist(true);
            onAdd?.(course.id);
          } else {
            // Re-throw for other types of errors
            throw addError;
          }
        }
      }
    } catch (error) {
      console.error(
        `Error ${isInWishlist ? "removing from" : "adding to"} wishlist:`,
        error
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={`${maxWidth} ${height} rounded-xl bg-white shadow-sm overflow-hidden m-3 flex flex-col h-full`}
    >
      <Link href={`/course/${course.slug}`}>
        <div className="relative w-full h-40 aspect-[359/154] overflow-hidden flex-shrink-0">
          <Image
            src={course.thumbnail || "/placeholder-course.webp"}
            alt={course.title || "Course thumbnail"}
            fill
            className="object-cover"
            unoptimized={!course.thumbnail}
          />
        </div>
      </Link>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="border border-[#136A86] rounded-md max-w-fit h-[25px] px-2 flex gap-2 items-center">
        <NetworkSignal difficulty={course.difficulty} />

          <span className="text-xs capitalize font-semibold text-[#136A86]">
            {course.difficulty}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <h1 className="font-bold text-lg flex-1 text-gray-800 line-clamp-2 min-h-[3.5rem]">
            {course.title}
          </h1>
          {isLoading ? (
            <Loader2 size={30} className="text-gray-400 animate-spin" />
          ) : (
            <Heart
              size={30}
              onClick={handleHeartClick}
              className={`cursor-pointer ${
                isInWishlist ? "text-red-600 fill-red-600" : "text-gray-400"
              }`}
            />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={12} className="text-[#5CB5BD]" />
          <div className="flex items-center gap-2">
            <span>{formatDuration(course.duration)}</span>
            <span className="text-[#5CB5BD]">|</span>
            <span>{course.instructorName}</span>
          </div>
        </div>

        {/* Push the button to the bottom of the card */}
        <div className="mt-auto mb-2">
          {course.isEnrolled ? (
            <Link
              href={`/intern/course/${course.slug}/learn`}
              className="bg-[#136A86] cursor-pointer flex items-center justify-center w-full h-12 rounded-md text-white font-medium hover:bg-[#5CB5BD] transition"
            >
              CONTINUE LEARNING
            </Link>
          ) : (
            <Link
              href={`/intern/course/${course.slug}`}
              className="bg-[#136A86] cursor-pointer flex items-center justify-center w-full h-12 rounded-md text-white font-medium hover:bg-[#5CB5BD] transition"
            >
              GET STARTED
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
