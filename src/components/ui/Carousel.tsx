"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useEffect, useState } from "react";

import CourseCard from "./Card";
import WishListCourseCard from "./WishListCard";
import { CourseCardData, Enrollment } from "@/types/course.types";
import CardSkeleton from "../common/CardSkeleton";

export default function CourseCarousel({
  cardType,
  slidesPerView = 3,
  data,
  loading = false,
  fromAC = false,
  widthCard = "w-full max-w-[359px]",
  mainCourseId = null,
}: {
  cardType: string;
  slidesPerView?: number;
  data: CourseCardData[] | Enrollment[];
  widthCard?: string;
  loading?: boolean;
  fromAC?: boolean;
  mainCourseId?: number | null;
}) {
  // Add window width state to better handle responsiveness
  const [windowWidth, setWindowWidth] = useState(0);
  const [courses, setCourses] = useState<Array<CourseCardData | Enrollment>>(
    Array.isArray(data) ? data : []
  );
  useEffect(() => {
    // Set initial window width and update on resize
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    setCourses(Array.isArray(data) ? data : []);
  }, [data]);
  
  if (loading) {
    return (
      <div className="flex flex-row justify-center items-center w-full">
        {Array.from({ length: slidesPerView }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }
  
  if (!loading && courses && courses.length === 0) {
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
             {fromAC ? "It seems we don't have any course suggestions right now. Feel free to explore our full catalog or tweak your filters to discover something new." : "This instructor hasn't published any additional courses yet. Check back soon or browse our catalog for more learning options."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full mx-auto px-2">
      <style jsx global>{`
        /* Custom dot colors and size based on image */
        .swiper-pagination-bullet {
          background: #cfe0e3;
          opacity: 1;
          width: 12px;
          height: 12px;
          margin: 0 5px;
          transition: all 0.3s ease;
          border-radius: 50%;
        }

        .swiper-pagination-bullet-active {
          background: #136A86;
          width: 12px;
          height: 12px;
        }

        /* Container styling for pagination dots */
        .swiper-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 5px;
        }

        /* Add space between slides and dots */
        .swiper {
          padding-bottom: 40px !important;
        }

        /* Center slides */
        .swiper-wrapper {
          display: flex;
          align-items: start;
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
        centeredSlides={courses.length === 1}
        slidesPerView={slidesPerView}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          640: {
            slidesPerView: Math.min(2, courses.length),
            spaceBetween: 0,
          },
          768: {
            slidesPerView: Math.min(2, courses.length),
            spaceBetween: 0,
          },
          1024: {
            slidesPerView: Math.min(3, courses.length),
            spaceBetween: 0,
          },
          1280: {
            slidesPerView: Math.min(slidesPerView, courses.length),
            spaceBetween: 0,
          },
        }}
        pagination={{
          clickable: true,
          dynamicBullets: courses.length > slidesPerView,
        }}
         autoplay={courses.length > slidesPerView ? {
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        } : false}
        loop={courses.length > 2}
        modules={[Pagination, Autoplay]}
        className="mySwiper w-full"
      >
        {courses?.map((c, i) => (
          <SwiperSlide
            key={i}
            className="flex justify-center items-center w-full"
          >
            <div className="w-full flex justify-center px-1">
              {cardType === "course" ? (
                <CourseCard enrollment={c as Enrollment} />
                
              ) : (
                <WishListCourseCard
                height="h-[390px]"
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