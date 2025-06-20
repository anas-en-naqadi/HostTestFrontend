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
import { navigate } from "@/lib/utils/navigator";
import { formatDuration } from "@/utils/formatDuration";
import VideoPlayer from "@/components/ui/VideoPlayer";
import CourseCarousel from "@/components/ui/Carousel";
import DOMPurify from "isomorphic-dompurify";
import { toast } from "sonner";
import { useFetchAboutCourse } from "@/lib/hooks/useFetchAboutCourse";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FormattedCourse } from "@/types/course.types";
import { useParams } from "next/navigation";
import { addToWishlist, removeFromWishlist } from "@/lib/api";
import { useStoreEnrollment } from "@/lib/hooks/useStoreEnrollment";
import Spinner from "@/components/common/spinner";
import { NetworkSignal } from "@/components/common/networkSignal";
import ReactQuill from "react-quill-new";
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
  const pathname = usePathname();
  const slug = params.slug as string;
  const [course, setCourse] = useState<FormattedCourse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { mutateAsync: fetchAboutCourse } = useFetchAboutCourse();
  const { mutateAsync: storeEnrollment, isPending } = useStoreEnrollment();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  // Use a ref to track if we've already fetched data
  const dataFetchedRef = useRef(false);
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
    console.log(window.scrollY);
  }, [slug]);
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const res = await fetchAboutCourse(slug);
        if (isMounted) {
          setCourse(res.data);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };
  
    fetchData();
  
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const [inWishlist, setInWishlist] = useState<boolean>(false);
  useEffect(() => {
    if (course) {
      setInWishlist(course.isInWishList);
    }
  }, [course]);

  const enrollNewCourse = async () => {
    if (!course || isSubmitting) return;

    try {
      if (!isSubmitting) {
        setIsSubmitting(true);
        const res = await storeEnrollment({ courseId: course.id });

        toast.success("You’ve successfully enrolled in this course", {
          duration: 1000,
          onAutoClose: () => {
            navigate(`/intern/course/${course.slug}/learn`);
          },
          onDismiss: () => {
            navigate(`/intern/course/${course.slug}/learn`);
          },
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Failed to enroll in course");
      console.error("Enrollment error:", error);
    }
  };
  // Wishlist handlers
  const handleWishListClick = async () => {
    if (!course || wishlistLoading) return;

    try {
      setWishlistLoading(true);

      if (inWishlist) {
        await removeFromWishlist({
          course_id: course.id,
          main_course_id: course.id,
        });
        setInWishlist(false);
      } else {
        await addToWishlist({
          course_id: course.id,
          main_course_id: course.id,
        });
        setInWishlist(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };
  if (!course) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }
  const buttonLoading = isPending || isSubmitting;

  // Share course functionality
  const handleShareCourse = async () => {
    if (!course) return;
    
    setIsSharing(true);
    try {
      // Get the full URL of the current page
      const url = window.location.origin + pathname;
      const shareData = {
        title: course.title,
        text: `🚀 I just found an awesome course on ${process.env.PLATFORM_NAME || "Forge"}!\n“${course.title}” — ${course.subtitle}\nJoin me and start learning today! 👉\n\n${url}`,
      };

      // Use Web Share API if available
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(url);
        toast.success("Course link copied to clipboard");
      }
    } catch (error) {
      // User canceled or sharing failed
      console.error("Error sharing course:", error);
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share course");
      }
    } finally {
      setIsSharing(false);
    }
  };
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

                    {wishlistLoading ? (
                      <Loader2
                        width={25}
                        height={23}
                        className="animate-spin text-gray-400"
                      />
                    ) : (
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
                    )}
                  </div>
                  <h2 className="font-normal -mt-3 -mb-2 text-md ">
                    {course.subtitle}
                  </h2>
                  <div className="flex flex-col justify-start gap-4">
                    <div className="border-1 border-[#136A86] rounded-md max-w-fit h-[25px] p-2 flex gap-2 items-center">
                      <NetworkSignal difficulty={course.difficulty} />
                      <span className="text-xs capitalize font-semibold text-[#136A86]">
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

                  {/* Updated container implementation */}
                  <div className="relative w-full rounded-lg overflow-hidden md:h-[391px]">
                    <VideoPlayer
                      url={course?.introVideo}
                      isWhat="intro"
                      Boxheight="391px"
                    />
                  </div>
                </div>

                <div id="courseContent" className="flex flex-col -mt-5  gap-7">
                  <h1 className="font-bold text-xl md:text-2xl">
                    This course includes:
                  </h1>

                  <div id="description">
                    <h2 className="text-[#136A86] underline text-lg mb-3 font-medium">
                      Description
                    </h2>

                    <ReactQuill
                      value={DOMPurify.sanitize(course.description!)}
                      theme="snow"
                      modules={{ toolbar: false }}
                      readOnly={true}
                      className="my-quill"
                    />
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
              <div className="w-full xl:w-[30%] sticky top-3 h-[calc(100vh-80px)]">
              <div className="flex flex-col text-sm md:text-md gap-10">
              <div
                  id="action-buttons"
                  className="flex items-center gap-7 justify-center sm:text-md md:text-xs xl:text-md flex-col px-8"
                >
                  {Object.keys(course).length > 0 && course.isPublished ? (
                    course.isEnrolled ? (
                      <span className="bg-green-50 w-full border-green-800 border-1 mt-2 xl:mt-4 h-12 rounded-md text-green-800 font-semibold flex items-center justify-center">
                        Already Enrolled in
                      </span>
                    ) : (
                      <button
                        onClick={enrollNewCourse}
                        disabled={buttonLoading}
                        type="button"
                        className={`
                          ${
                            buttonLoading
                              ? "cursor-not-allowed opacity-75"
                              : "cursor-pointer"
                          }
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
                        {isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin text-white mr-2" />{" "}
                            LOADING...
                          </>
                        ) : (
                          "START COURSE"
                        )}
                      </button>
                    )
                  ) : (
                    <span className="bg-red-50 w-full border-red-800 border-1 mt-2 xl:mt-4 h-12 rounded-md text-red-800 font-semibold flex items-center justify-center">
                      Course is not published yet
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleShareCourse}
                    disabled={isSharing}
                    className="border border-cyan-700 w-full flex h-12 items-center rounded-md text-cyan-700 cursor-pointer font-semibold justify-center gap-2"
                  >
                    {isSharing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-cyan-700 mr-2" />
                        SHARING...
                      </>
                    ) : (
                      <>
                        <Share2 size={17} />
                        SHARE COURSE
                      </>
                    )}
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
                  <div className="mt-2">
                    <ReactQuill
                      value={DOMPurify.sanitize(course.instructor.description!)}
                      theme="snow"
                      modules={{ toolbar: false }}
                      readOnly={true}
                      className="my-quill"
                    />
                  </div>
                </div>
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
                  slidesPerView={3}
                  fromAC={true}
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
