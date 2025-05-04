"use client";
import CourseCard from "@/components/ui/Card";
import StatsSection from "./StatsSection";
import GraphSection from "./GraphSection";
import { ArrowRight } from "lucide-react";
import CourseCarousel from "@/components/ui/Carousel";
import { useFetchFewEnrollments } from "@/lib/hooks/dashboard/useFetchFewEnrollments";
import { EnrollmentItem } from "@/types/enrollment.types";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useFieldSuggestions,
  useNextLearningCourses,
} from "@/lib/hooks/dashboard/useDashboardHooks";
import CardSkeleton from "@/components/common/CardSkeleton";
export default function DashboardPage() {
  const [keepLearning, setKeepLearning] = useState<EnrollmentItem[] | null>(
    null
  );

  const { mutateAsync: fetchFewEnrollments } = useFetchFewEnrollments(); // 3️⃣ Wishlist mutations
  const { data: nextCourses } = useNextLearningCourses();
  const { data: fieldSuggestions } = useFieldSuggestions();

  useEffect(() => {
    fetchFewEnrollments().then((res) => setKeepLearning(res.data));
  }, []);

  return (
    <div className="flex flex-col gap-14 h-full min-h-screen overflow-y-hidden">
      <section className="flex max-h-fit flex-col py-6 space-y-6 px-3 md:px-0">
        <StatsSection />
        <GraphSection />
      </section>

      <section className="w-full">
        <div className="flex mx-3 justify-between mb-4">
          <h1 className="text-lg lg:text-xl font-bold">Continue learning</h1>
          <Link
            href="/intern/home"
            className="text-sm lg:text-md flex gap-2 items-center text-[#136A86] cursor-pointer font-sans hover:underline"
          >
            See all courses <ArrowRight size={18} className="text-[#136A86]" />
          </Link>
        </div>
        {keepLearning && keepLearning.length > 1 ? (
          <div
            className={`flex relative max-w-full w-full flex-wrap lg:flex-nowrap ${
              keepLearning.length > 1 ? "justify-start" : "md:justify-between "
            }`}
          >
            {keepLearning.map((c, index) => (
              <CourseCard enrollment={c} key={index} />
            ))}
          </div>
        ) : !keepLearning ? (
          <div className="flex flex-row justify-center items-center w-full">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="w-full flex justify-center py-8">
            <div className=" w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex items-center">
              {/* Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>

              {/* Text */}
              <div className="ml-4">
                <h3 className="text-gray-800 text-lg font-semibold">
                  You aren’t enrolled in any courses yet
                </h3>
                <p className="text-gray-600 mt-1">
                  Browse available courses and start learning today.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="bg-[linear-gradient(263.58deg,#1B5968_0%,#5CB5BD_55%,#136A86_100%),linear-gradient(180deg,rgba(19,106,134,0.3)_13.56%,rgba(19,106,134,0)_31.83%)] p-5 rounded-xl max-h-fit ">
          <div className="flex justify-center flex-col items-center my-6">
            <h1 className="text-white lg:text-2xl xl:text-3xl text-lg md:text-xl font-semibold font-lora mb-10">
              What to learn next ?
            </h1>
            <CourseCarousel cardType="wishlist" data={nextCourses?.data} />
          </div>
        </div>
      </section>

      <section className="w-full ml-auto">
        <h1 className="text-lg lg:text-xl font-bold mb-4">
          Field-focused suggestions
        </h1>

        <div className="w-full">
          {<CourseCarousel cardType="wishlist" data={fieldSuggestions?.data} />}
        </div>
      </section>
    </div>
  );
}
