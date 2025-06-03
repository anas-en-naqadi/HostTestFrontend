import React from "react";
import Image from "next/image";
import Link from "next/link";

interface Course {
  id: string;
  thumbnail: string;
  slug: string;
  title: string;
  participants: number;
}

interface PopularCoursesCardProps {
  courses: Course[];
}

export default function PopularCoursesCard({
  courses,
}: PopularCoursesCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 min-h-full">
      <h2 className="text-lg md:text-xl 2xl:text-2xl font-semibold text-[#136A86] mb-4">
        Most Popular Courses
      </h2>

      <div className="space-y-3 min-h-full w-full">
        {courses.length > 0 ? (
          <>
            {courses.map((course) => (
              <Link
              href={`/intern/course/${course.slug}`}
                key={course.id}
                className="flex flex-col hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between gap-3 p-2 rounded-lg transition-colors"
              >
                {/* Left: Thumbnail and Title */}
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  <div className="flex-shrink-0 relative w-16 h-12 xl:w-20 xl:h-16 rounded-md overflow-hidden">
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300" />
                      )}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-sm md:text-base xl:text-xl font-medium leading-tight line-clamp-4">
                      {course.title}
                    </h3>
                  </div>
                </div>

                {/* Right: Participants Count */}
                <div className="sm:text-right">
                  <div className="text-xs md:text-[15px] font-medium text-[#8C8FA5]">
                    {course.participants}
                  </div>
                  <div className="text-xs md:text-[15px] text-[#8C8FA5]">Participants</div>
                </div>
              </Link>
            ))}
          </>
        ) : (
          <div className="text-center w-full h-full flex items-center justify-center font-normal text-sm lg:text-base  text-gray-500 italic">
            No popular courses available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
