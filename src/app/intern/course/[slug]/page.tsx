"use client";
import CourseModules from "@/components/ui/CourseAccordion";
import {
  Heart,
  Clock,
  Calendar,
  Languages,
  Share2,
  ChevronLeft,
  User,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { navigate } from "@/lib/utils/navigator";
import { formatDuration } from "@/utils/formatDuration";
import VideoPlayer from "@/components/features/VideoPlayer";
import CourseCarousel from "@/components/ui/Carousel";
import { toast } from "sonner";
import { useFetchAboutCourse } from "@/lib/hooks/useFetchAboutCourse";
import { useEffect, useState } from "react";
import { FormattedCourse } from "@/types/course.types";
import { useParams } from "next/navigation";
import { addToWishlist, removeFromWishlist } from "@/lib/api";
import { useStoreEnrollment } from "@/lib/hooks/useStoreEnrollment";
import Spinner from "@/components/common/spinner";
function SimpleAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <div className="w-12 h-12 mb-2 rounded-full bg-cyan-700 flex items-center justify-center text-white font-semibold">
      {initials}
    </div>
  );
}

export default function CourseOverView() {
  const params = useParams();
  const slug = params.slug as string;

  // const {
  //   data: course,
  //   isLoading,
  //   isError,
  // } = useFetchAboutCourse(slug);
  const [course, setCourse] = useState<FormattedCourse | null>(null);
  const { mutateAsync: fetchAboutCourse } = useFetchAboutCourse(); // 3️⃣ Wishlist mutations
  const { mutateAsync: storeEnrollment, isPending } = useStoreEnrollment(); // 3️⃣ Wishlist mutations

  useEffect(() => {
    fetchAboutCourse(slug).then((res) => setCourse(res.data));
  }, [slug]);
  // const addWish = useAddToWishlist();
  // const removeWish = useRemoveFromWishlist();
  const [inWishlist, setInWishlist] = useState<boolean>();
  useEffect(() => {
    if (course) {
      setInWishlist(course.isInWishList);
    }
    console.log(course);
  }, [course]);

  // Set local wishlist state once course loads
  if (!isPending && course && inWishlist === undefined) {
    setInWishlist(course.isInWishList);
  }
  const enrollNewCourse = () => {
    if (course) {
      storeEnrollment({ courseId: course.id }).then((res) =>
        toast.success(res.message, {
          duration: 1000, // Duration in milliseconds
          onAutoClose: () => {
            navigate(`/intern/course/${course.slug}/learn`);
          },
        })
      );
    }
  };
  // 4️⃣ Handlers
  const handleWishListClick = () => {
    if (!course) return;
    if (inWishlist) {
      removeFromWishlist({ course_id: course.id, main_course_id: course.id });
      setInWishlist(false);
    } else {
      addToWishlist({ course_id: course.id, main_course_id: course.id });
      setInWishlist(true);
    }
  };

  if (course === null) {
    return <div className="w-full overflow-hidden -mt-30 h-screen relative flex justify-center items-center">
    <Spinner />
  </div>
    
  }
  return (
    <>
      {Object.keys(course).length > 0 && (
        <div className="mt-16">
          <h1 className="text-sm font-bold uppercase flex items-center gap-1">
            <ChevronLeft width={15} />
            {course.title}
          </h1>

          <div className="flex flex-col gap-14 w-full">
            <div className="flex w-full flex-wrap xl:flex-nowrap mt-10 gap-10 justify-between">
              {/* Left side (70%) */}
              <div
                id="course-info-container"
                className="bg-white rounded-lg p-6 w-full xl:w-[70%] flex flex-col gap-12"
              >
                <div id="courseInfo" className="flex flex-col gap-6">
                  <span className="bg-[#5CB5BD] text-[10px] px-2 py-1 max-w-fit font-bold text-white rounded-md">
                    {course.categories.name}
                  </span>

                  <div className="flex -mt-2 justify-between items-center text-xl sm:text-2xl lg:text-3xl font-semibold">
                    <h1>{course.title}</h1>

                    <Heart
                      width={25}
                      height={23}
                      onClick={() => handleWishListClick()}
                      className={
                        inWishlist
                          ? "text-red-600 fill-red-600 cursor-pointer"
                          : "cursor-pointer"
                      }
                    />
                  </div>
                  <h2 className="font-normal -mt-3 -mb-2 text-md ">
                    {course.subtitle}
                  </h2>
                  <div className="flex flex-col justify-start gap-4">
                    <div className="border-1 border-[#136A86] rounded-md max-w-fit h-[25px] p-2 flex gap-2 items-center">
                      <Image
                        src="/network-signal.svg"
                        alt="network signal"
                        width={9}
                        height={9}
                      />
                      <span className="text-xs font-semibold text-[#136A86]">
                        {course.difficulty}
                      </span>
                    </div>
                    <span className="text-cyan-700 text-xs md:text-sm">
                      Created by <b>{course.instructor.fullName}</b>
                    </span>
                    <div className="text-gray-500/90 text-xs flex flex-wrap lg:flex-nowrap gap-3 -mt-2">
                      <span className="flex items-center gap-2">
                        <Clock size={12} className="text-[#5CB5BD]" />
                        {formatDuration(course.duration)}
                      </span>
                      <pre className="text-black">|</pre>
                      <span className="flex items-center gap-2">
                        <Languages size={12} className="text-[#5CB5BD]" />{" "}
                        Francais
                      </span>
                      <pre className="text-black">|</pre>
                      <span className="flex items-center gap-2">
                        <Calendar size={12} className="text-[#5CB5BD]" /> Last
                        Updated{" "}
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                      <pre className="text-black">|</pre>
                      <span className="flex items-center gap-2">
                        <User size={12} className="text-[#5CB5BD]" />
                        {course.enrollmentsCount} participants
                      </span>
                    </div>
                  </div>

                  <div
                    className="relative w-full rounded-lg overflow-hidden
                aspect-video     /* 16:9 on small */
                md:aspect-auto   /* disable aspect-ratio on md+ */
                md:h-[341px]     /* fixed height on md+ */
"
                  >
                    <VideoPlayer url={course?.introVideo} />
                  </div>
                </div>

                <div id="courseContent" className="flex flex-col -mt-1 gap-7">
                  <h1 className="font-bold text-xl md:text-2xl">
                    This course includes:
                  </h1>

                  <div id="description">
                    <h2 className="text-[#136A86] underline text-lg mb-3 font-medium">
                      Description
                    </h2>
                    <p className="text-md font-medium">{course.description}</p>
                  </div>

                  <div id="course-content" className="flex flex-col gap-5">
                    <div>
                      <h2 className="text-[#136A86] underline text-lg font-medium">
                        Course Content
                      </h2>
                      <div className="flex gap-4 text-xs font-medium items-center mt-5">
                        <span>{course.modules.length} modules</span>
                        <pre className="text-[#5CB5BD]">|</pre>
                        <span>
                          {course.modules.reduce(
                            (acc, m) => acc + m.lessons.length,
                            0
                          )}{" "}
                          lectures
                        </span>
                        <pre className="text-[#5CB5BD]">|</pre>
                        <span>
                          {formatDuration(course.duration)} total length
                        </span>
                      </div>
                    </div>
                    <CourseModules modules={course.modules} />
                  </div>

                  <div
                    id="course-requirements"
                    className="flex justify-start flex-col gap-5"
                  >
                    <h2 className="text-[#136A86] text-lg underline font-medium">
                      Requirements
                    </h2>
                    <ul className="ml-6 -mt-1 text-md mb-4 font-normal">
                      {course.requirements.map((req, i) => (
                        <li className="list-disc" key={i}>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right side (30%) */}
              <div className="w-full xl:w-[30%] flex flex-col text-sm md:text-md gap-10">
                <div
                  id="action-buttons"
                  className="flex items-center gap-7 justify-center sm:text-md md:text-xs xl:text-md flex-col px-8"
                >
                  {Object.keys(course).length > 0 && course.isEnrolled ? (
                    <span className="bg-green-50 w-full border-green-800 border-1 mt-2 xl:mt-4 h-12 rounded-md text-green-800 font-semibold flex items-center justify-center">
                      Already Enrolled in
                    </span>
                  ) : (
                    <button
                      onClick={() => enrollNewCourse()}
                      disabled={isPending}
                      type="button"
                      className={`
                        ${isPending ? "cursor-not-allowed" : "cursor-pointer"}
                        bg-cyan-800
                        w-full
                        mt-2 xl:mt-4
                        h-12
                        rounded-md
                        text-white
                        font-semibold
                        flex items-center justify-center
                      `}
                    >
                                    
                                    {isPending ? (<><Loader2 className="h-5 w-5 animate-spin text-white mr-2" /> LOADING...</> ) : 'START COURSE'}
                    </button>
                  )}

                  <button
                    type="button"
                    className="border border-cyan-700 w-full flex h-12 items-center rounded-md text-cyan-700 cursor-pointer font-semibold justify-center gap-2"
                  >
                    <Share2 size={17} />
                    SHARE COURSE
                  </button>
                </div>

                <div className="bg-white w-full rounded-lg shadow-md p-6 ml-auto">
                  <h1 className="text-lg font-semibold mb-5">
                    What you’ll learn
                  </h1>
                  <ul className="pl-7">
                    {course.whatYouWillLearn.map((w, i) => (
                      <li className="list-disc text-md font-normal" key={i}>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white w-full max-h-fit rounded-lg shadow-md p-6">
                  <h1 className="font-semibold text-[1.2rem]">Instructor</h1>
                  <h1 className="font-bold uppercase text-md text-cyan-700 mt-3 mb-2">
                    {course.instructor.fullName}
                  </h1>
                  <SimpleAvatar name={course.instructor.fullName} />

                  <span className="text-xs text-gray-500/90 font-medium">
                    {course.instructor.specialization}
                  </span>
                  <p className="text-md font-[400] mt-2">
                    {course.instructor.bio ?? course.instructor.description}
                  </p>
                </div>
              </div>
            </div>

            {/* More Courses by Instructor (spans full width) */}
            <div id="course-suggestions" className="w-full xl:w-[70%]">
              <h1 className="font-semibold text-lg md:text-2xl mb-4">
                More Courses by Instructor
              </h1>
              <div className="md:-ml-3 w-full flex flex-wrap xl:flex-nowrap justify-center items-center">
                <CourseCarousel
                  widthCard={
                    "w-[85%]"
                  }
                  slidesPerView={
                    course.instructor.otherCourses.length > 3 ? 2 : 1.5
                  }
                  cardType="wishlist"
                  data={course.instructor.otherCourses}
                  mainCourseId={course.id}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
