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

  const { mutateAsync: fetchFewEnrollments, isPending: hasEnrollments } =
    useFetchFewEnrollments(); // 3️⃣ Wishlist mutations
  const { data: nextCourses, isPending } = useNextLearningCourses();
  const { data: fieldSuggestions, isLoading: isFieldLoading } =
    useFieldSuggestions();
  const [nextTolearn, setNextTolearn] = useState(nextCourses);
  const [suggestions, setSuggestions] = useState(nextCourses);

  useEffect(() => {
    fetchFewEnrollments().then((res) => setKeepLearning(res.data));
  }, []);
  useEffect(() => {
    if (nextCourses && fieldSuggestions) {
      setNextTolearn(nextCourses.data);
      setSuggestions(fieldSuggestions.data);
    }
  }, [nextCourses, fieldSuggestions]);

 
  return (
    <div className="flex flex-col gap-14 h-full min-h-screen overflow-hidden">
      <section className="flex max-h-fit flex-col py-6 space-y-6 px-3 md:px-0">
        <StatsSection />
        <GraphSection />
      </section>

      <section className="w-full">
        <div className="flex mx-3 justify-between mb-4">
          <h1 className="text-lg lg:text-xl font-bold">Continue learning</h1>
          <Link
            href="/intern/home"
            className="text-xs sm:text-sm lg:text-md flex gap-1 sm:gap-2 items-center text-[#136A86] cursor-pointer font-sans hover:underline"
          >
            See all courses{" "}
            <ArrowRight
              size={18}
              className="text-[#136A86] w-3 h-3 sm:w-[14px] sm:h-[14px] mt-0.5 lg:w-[18px] lg:h-[18px]"
            />
          </Link>
        </div>
        <div
          className={`
          grid gap-4 w-full p-3
          grid-cols-1           
          sm:grid-cols-2       
          lg:grid-cols-3       
          ${
            keepLearning?.length === 1
              ? "place-items-center"
              : keepLearning?.length === 2
              ? "sm:place-items-center"
              : ""
          }
        `}
        >
          {
           ( hasEnrollments && !keepLearning) &&  (
              Array.from({ length: 3 }).map((_, index) => (
      <CardSkeleton key={index} />
    ))
            )
          }
          {keepLearning && keepLearning.length >= 1 ? (
            keepLearning.map((c, i) => <CourseCard enrollment={c} key={i} />)
          ) : (
            <div className="w-full col-span-full flex justify-center py-8">
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
        </div>
      </section>

      <section>
        <div className="bg-[linear-gradient(263.58deg,#1B5968_0%,#5CB5BD_55%,#136A86_100%),linear-gradient(180deg,rgba(19,106,134,0.3)_13.56%,rgba(19,106,134,0)_31.83%)] p-5 rounded-xl max-h-fit ">
          <div className="flex justify-center flex-col items-center my-6">
            <h1 className="text-white lg:text-2xl xl:text-3xl text-lg md:text-xl font-semibold font-lora mb-10">
              What to learn next ?
            </h1>
            <CourseCarousel
              widthCard={
                suggestions?.length <= 2 ? "w-[75%]" : "w-full w-[395px]"
              }
              loading={isPending}
              cardType="wishlist"
              data={nextTolearn}
            />
          </div>
        </div>
      </section>

      <section className="w-full ml-auto">
        <h1 className="text-lg lg:text-xl font-bold mb-4">
          Field-focused suggestions
        </h1>

        <div className="w-full">
          {
            <CourseCarousel
              slidesPerView={4}
              widthCard={
                nextTolearn?.length <= 2 ? "w-[75%]" : "w-full w-[395px]"
              }
              loading={isFieldLoading}
              cardType="wishlist"
              data={suggestions}
            />
          }
        </div>
      </section>
    </div>
  );
}
