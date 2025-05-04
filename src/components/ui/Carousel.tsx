"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import CourseCard from "./Card";
import WishListCourseCard from "./WishListCard";
import { CourseCardData, Enrollment } from "@/types/course.types";
import CardSkeleton from "../common/CardSkeleton";

export default function CourseCarousel({
  cardType,
  slidesPerView = 3,
  data,
  widthCard = "w-full max-w-[359px]",
  mainCourseId = null,
}: {
  cardType: string;
  slidesPerView?: number;
  data: CourseCardData[] | Enrollment[];
  widthCard?: string;
  mainCourseId?: number | null;
}) {
  if (!data) {
    console.log(data);
    return (
      <div className="flex flex-row justify-center items-center w-full">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="w-full flex justify-center py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-6 flex items-start space-x-4 ">
          {/* Info Icon */}
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

          {/* Combined Message */}
          <div>
            <h3 className="text-gray-800 text-lg font-semibold">
              No Courses to Show
            </h3>
            <p className="text-gray-600 mt-1">
              We don’t have any course recommendations right now. Try browsing
              our full catalog or adjusting your filters to find the perfect
              course.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full mx-auto">
      <style jsx global>{`
        /* Custom dot colors and size */
        .swiper-pagination-bullet {
          background: gray;
          color: white;
          opacity: 1;
          width: 14px;
          height: 14px;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          background: #136a86;
          width: 30px;
          border-radius: 4px;
        }

        /* Add space between slides and dots */
        .swiper {
          padding-bottom: 40px !important;
        }

        /* Center slides */
        .swiper-wrapper {
          display: flex;
          align-items: center;
        }

        /* Individual slide centering */
        .swiper-slide {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        breakpoints={{
          400: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          640: {
            slidesPerView: 1.5,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 0,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 0,
          },
          1280: {
            slidesPerView: slidesPerView || 3,
            spaceBetween: 0,
          },
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        modules={[Pagination, Autoplay]}
        className="mySwiper w-full"
      >
        {data?.map((c, i) => (
          <SwiperSlide
            key={i}
            className="flex justify-center items-center w-full"
          >
            <div className="w-full flex justify-center">
              {cardType === "course" ? (
                <CourseCard enrollment={c as Enrollment} />
              ) : (
                <WishListCourseCard
                  mainCourseId={mainCourseId}
                  maxWidth={widthCard}
                  course={c as CourseCardData}
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
