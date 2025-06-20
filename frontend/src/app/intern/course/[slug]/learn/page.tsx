"use client";

import VideoPlayer from "@/components/ui/VideoPlayer";
import Quiz from "@/components/ui/Quiz";
import { useParams } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import OverviewTab from "@/components/ui/OverviewTab";
import Instructor from "@/components/ui/Instructor";
import CourseHeader from "@/components/ui/CourseHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Clock,
  Video,
  Circle,
  FileText,
  Brain,
  Languages,
  Calendar,
  User,
  ChevronRight,
  Loader2,
  // BookOpen,
} from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { useState, useEffect, useCallback, useRef } from "react";
import Notes from "./Notes";
import Announcements from "./Annoucements";
import { useAuthStore } from "@/store/authStore";
import { useFetchCourseToLearn } from "@/lib/hooks/course/useFetchCourseToLearn";
import { LearnDetailResponse } from "@/types/course.types";
import Spinner from "@/components/common/spinner";
import { useStoreLessonProgress } from "@/lib/hooks/useStoreLessonProgress";
import { toast } from "sonner";
import { navigate } from "@/lib/utils/navigator";
import { NetworkSignal } from "@/components/common/networkSignal";
import { useQuizStore } from "@/store/quizStore";
import ReactQuill from "react-quill-new";
import { isAxiosError } from "axios";

export default function CourseLearningPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, isLoading, error } = useFetchCourseToLearn(slug);

  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTime, setCurrentTime] = useState(0);
  const [ActiveNoteMetadata, setActiveNoteMetadata] = useState({
    lessonId: 0,
    lesson_content_type: "",
  });
  const [videoDuration, setVideoDuration] = useState(0);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const { isQuizActive, setQuizActive } = useQuizStore();
  const [course, setCourse] = useState<LearnDetailResponse>();
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [canAutoPlay, setCanAutoPlay] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [openModuleValue, setOpenModuleValue] = useState<string>(
    `item-${activeModuleIndex + 1}`
  );
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);
  const { mutateAsync: storeLessonProgress } = useStoreLessonProgress(
    course?.slug || ""
  ); // 3️⃣ Wishlist mutations
  const courseIdRef = useRef<null | number>(null); // Kick off a 5-second countdown whenever doMoveToNextLesson is called
  const scheduleNextLesson = useCallback(() => {
    setNextCountdown(5);
  }, []);

  // Scroll to top on first render
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  }, [params]);

  // Modify your handleLessonSelect function to update active lesson state
  const handleLessonSelect = useCallback(
    async (

      lessonId: number,
      lesson_content_type: string
    ) => {
      setActiveNoteMetadata({

        lessonId,

        lesson_content_type,
      });

      if (!course) return;
      console.log("activeid", lessonId);

      // Find the module and lesson by ID
      const moduleIdx = course.modules.findIndex((m) =>
        m.lessons.some((l) => l.id === lessonId)
      );

      if (moduleIdx !== -1) {
        const lessonIdx = course.modules[moduleIdx].lessons.findIndex(
          (l) => l.id === lessonId
        );

        if (lessonIdx !== -1) {
          const lesson = course.modules[moduleIdx].lessons[lessonIdx];
          if (lesson.content_type === "video") setNextCountdown(null);
          console.log("activelesson", lesson);
          setActiveLesson(lesson);
          setActiveModuleIndex(moduleIdx);
          setActiveLessonIndex(lessonIdx);
        }
      }
    },
    [course, completedLessons]
  );
  // Effect to tick the countdown every second
  useEffect(() => {
    if (nextCountdown === null) return;
    if (nextCountdown <= 0) {
      // Time’s up → actually move
      doMoveToNextLesson();
      return setNextCountdown(null);
    }
    const timer = setTimeout(() => setNextCountdown(nextCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [nextCountdown]);

  useEffect(() => {
    setOpenModuleValue(`item-${activeModuleIndex + 1}`);
  }, [activeModuleIndex]);

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1280); // xl breakpoint
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);
  useEffect(() => {
    if (data) {
      setCourse({ ...data });
      // Log the actual data received from the API, not the previous state
      console.log("received course data from API", data);
    }
  }, [data]);

  // Force component to re-render when course data is updated
  useEffect(() => {
    if (course && activeLesson && activeLesson.content_type === "quiz") {
      // Update active lesson with the latest data from course
      const currentModule = course.modules[activeModuleIndex];
      if (currentModule && currentModule.lessons[activeLessonIndex]) {
        const updatedLesson = currentModule.lessons[activeLessonIndex];
        // Only update if the lesson ID is the same but content might have changed
        if (
          updatedLesson.id === activeLesson.id &&
          JSON.stringify(updatedLesson) !== JSON.stringify(activeLesson)
        ) {
          console.log("Updating active lesson with fresh data", updatedLesson);
          setActiveLesson(updatedLesson);
        }
      }
    }
  }, [course, activeModuleIndex, activeLessonIndex]);
  const handleStoreProgress = useCallback(
    async (id: number) => {
      if (!course?.slug) return;

      const lesson_progress_data = {
        lesson_id: id,
        slug: course.slug,
        completed_at: new Date().toISOString(),
      };

      try {
        console.log("Storing progress for lesson:", lesson_progress_data);
        await storeLessonProgress(lesson_progress_data);
      } catch (error) {
        console.error("Error storing lesson progress:", error);
        // Could add toast notification here
      }
    },
    [course?.slug, storeLessonProgress]
  );
  useEffect(() => {
    // Skip if course is not loaded
    if (!course) return;

    // Process completed lessons
    const newCompletedLessons = new Set<number>();
    course.modules?.forEach((module) => {
      module.lessons?.forEach((lesson) => {
        if (lesson.isCompleted) {
          newCompletedLessons.add(lesson.id);
        }
      });
    });

    // Update completedLessons state only once at initial load
    if (!hasInitializedRef.current) {
      setCompletedLessons(newCompletedLessons);
    } else {
      // For subsequent updates, only add new completed lessons from server
      // but don't remove ones that might be pending API confirmation
      const mergedCompletedLessons = new Set(completedLessons);
      newCompletedLessons.forEach((id) => mergedCompletedLessons.add(id));

      // Only update if there are new completed lessons
      if ([...newCompletedLessons].some((id) => !completedLessons.has(id))) {
        setCompletedLessons(mergedCompletedLessons);
      }
    }

    // Update ref to track course
    courseIdRef.current = course.id;
  }, [course]);

  // Function to select a lesson
  const selectLesson = useCallback(
    async (lesson, currentModule, moduleIndex: number, lessonIndex: number) => {
      setActiveLesson(lesson);
      setActiveModuleIndex(moduleIndex);
      setActiveLessonIndex(lessonIndex);
      setOpenModuleValue(`item-${moduleIndex + 1}`);

      handleLessonSelect(
        lesson.id,
        lesson.content_type
      );
    },
    [completedLessons, handleLessonSelect, handleStoreProgress]
  );
  const [isNextLessonProgressLoading, setIsNextLessonProgressLoading] =
    useState(false);
  const handleNextTextLesson = async () => {
    if (isNextLessonProgressLoading) return;
    if (
      activeLesson &&
      activeLesson.content_type === "text" &&
      !completedLessons.has(activeLesson.id) &&
      !activeLesson.isCompleted
    ) {
      setIsNextLessonProgressLoading(true);

      await handleStoreProgress(activeLesson.id)
        .then(() => {
          const newCompletedLessons = new Set(completedLessons);
          newCompletedLessons.add(activeLesson.id);
          setCompletedLessons(newCompletedLessons);
          doMoveToNextLesson();
        })
        .catch((error) => {
          console.error("Failed to store lesson progress:", error);
        })
        .finally(() => setIsNextLessonProgressLoading(false));
    }
  };
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (!course?.modules?.length || !completedLessons) return;

    // If a lesson is already selected and it's a text lesson, just mark the ref
    if (activeLesson?.content_type === "text") {
      console.log(
        "Lesson already selected, keeping current selection:",
        activeLesson.id
      );
      hasInitializedRef.current = true;
      return;
    }

    hasInitializedRef.current = true;
    // Get last accessed information
    const lastAccessed = course.enrollments[0];
    const lastModuleId = lastAccessed.last_accessed_module_id;
    const lastLessonId = lastAccessed.last_accessed_lesson_id;
    console.log("Last accessed module/lesson:", lastModuleId, lastLessonId);

    // If no last accessed data, start from beginning
    if (!lastModuleId || !lastLessonId) {
      if (course.modules[0]?.lessons[0]) {
        const firstModule = course.modules[0];
        const firstLesson = firstModule.lessons[0];
        console.log(
          "No last accessed data, selecting first lesson:",
          firstLesson.id
        );
        setActiveLesson(firstLesson);
        selectLesson(firstLesson, firstModule, 0, 0);
      }
      return;
    }

    // Find module and lesson indices
    const moduleIndex = course.modules.findIndex((m) => m.id === lastModuleId);
    console.log("Module index:", moduleIndex);

    if (moduleIndex === -1) {
      // Module not found, default to first module
      const firstModule = course.modules[0];
      const firstLesson = firstModule.lessons[0];
      console.log("Module not found, selecting first lesson:", firstLesson.id);
      setActiveLesson(firstLesson);
      selectLesson(firstLesson, firstModule, 0, 0);
      return;
    }

    const currentModule = course.modules[moduleIndex];
    const lessonIndex = currentModule.lessons.findIndex(
      (l) => l.id === lastLessonId
    );

    if (lessonIndex === -1) {
      // Lesson not found, default to first lesson of the module
      const firstLesson = currentModule.lessons[0];
      console.log(
        "Lesson not found, selecting module's first lesson:",
        firstLesson.id
      );
      setActiveLesson(firstLesson);
      selectLesson(firstLesson, currentModule, moduleIndex, 0);
      return;
    }

    // Get the current lesson
    const currentLesson = currentModule.lessons[lessonIndex];
    console.log("Current lesson:", currentLesson.id, currentLesson.title);

    // Check if the current lesson is completed
    const isCurrentLessonCompleted =
      completedLessons.has(currentLesson.id) || currentLesson.isCompleted;

    if (isCurrentLessonCompleted) {
      console.log(
        "Current lesson is completed, looking for next uncompleted lesson"
      );
      // Find the next uncompleted lesson

      // First try remaining lessons in current module
      let foundNextLesson = false;

      // Look within current module first
      for (let i = lessonIndex + 1; i < currentModule.lessons.length; i++) {
        const lesson = currentModule.lessons[i];
        if (!completedLessons.has(lesson.id) && !lesson.isCompleted) {
          console.log(
            "Found next uncompleted lesson in current module:",
            lesson.id,
            lesson.title
          );
          setActiveLesson(lesson);
          selectLesson(lesson, currentModule, moduleIndex, i);
          foundNextLesson = true;
          break;
        }
      }

      // If not found in current module, look in subsequent modules
      if (!foundNextLesson) {
        for (let m = moduleIndex + 1; m < course.modules.length; m++) {
          const nextModule = course.modules[m];
          for (let l = 0; l < nextModule.lessons.length; l++) {
            const lesson = nextModule.lessons[l];
            if (!completedLessons.has(lesson.id) && !lesson.isCompleted) {
              console.log(
                "Found next uncompleted lesson in next module:",
                lesson.id,
                lesson.title
              );
              setActiveLesson(lesson);
              selectLesson(lesson, nextModule, m, l);
              foundNextLesson = true;
              break;
            }
          }
          if (foundNextLesson) break;
        }
      }

      // If no uncompleted lesson found, stay on the current lesson
      if (!foundNextLesson) {
        console.log(
          "No uncompleted lessons found, staying on current lesson:",
          currentLesson.id
        );
        setActiveLesson(currentLesson);
        selectLesson(currentLesson, currentModule, moduleIndex, lessonIndex);
      }
    } else {
      // Current lesson is not completed, so stay on it
      console.log(
        "Current lesson not completed, staying on it:",
        currentLesson.id
      );
      setActiveLesson(currentLesson);
      selectLesson(currentLesson, currentModule, moduleIndex, lessonIndex);
    }
  }, [course, completedLessons, selectLesson, activeLesson]);
  const getLessonIcon = (type: string) => {
    const commonClass = "text-[#8C8FA5]";
    switch (type) {
      case "video":
        return <Video size={16} className={commonClass} />;
      case "text":
        return <FileText size={16} className={commonClass} />;
      case "quiz":
        return <Brain size={16} className={commonClass} />;
      default:
        return <Circle size={16} />;
    }
  };
  // And change your original moveToNextLesson to just schedule:
  const moveToNextLesson = useCallback(() => {
    scheduleNextLesson();
  }, []);

  const handleVideoProgress = useCallback(
    async ({ playedSeconds }: { playedSeconds: number }) => {
      setCurrentTime(playedSeconds);

      // Only proceed if we have an active lesson and know the video duration
      if (!activeLesson || videoDuration <= 0) return;

      const lessonId = activeLesson.id;

      // Check if we're at least at (duration - 5 seconds)
      if (videoDuration - playedSeconds <= 5) {
        // Mark as completed if not already in our completed set
        if (!completedLessons.has(lessonId)) {
          // Create a new set to avoid mutation issues
          const newCompletedLessons = new Set(completedLessons);
          newCompletedLessons.add(lessonId);
          setCompletedLessons(newCompletedLessons);

          try {
            await handleStoreProgress(lessonId);
          } catch (error) {
            console.error("Failed to store video progress:", error);
          }
        }
      }

      if (playedSeconds === videoDuration) {
        moveToNextLesson();
      }
    },
    [
      activeLesson,
      videoDuration,
      completedLessons,
      handleStoreProgress,
      moveToNextLesson,
    ]
  );

  // Function to move to the next lesson
  const doMoveToNextLesson = () => {
    // Set loading state to true before transition
    setCanAutoPlay(true);

    // Small delay to ensure clean transition
    setTimeout(() => {
      // Find the next lesson
      if (course && activeModuleIndex !== -1 && activeLessonIndex !== -1) {
        const currentModule = course.modules[activeModuleIndex];

        // Check if there's another lesson in this module
        if (activeLessonIndex + 1 < currentModule.lessons.length) {
          const nextLesson = currentModule.lessons[activeLessonIndex + 1];

          selectLesson(
            nextLesson,
            currentModule,
            activeModuleIndex,
            activeLessonIndex + 1
          );
        }
        // If not, check if there's another module
        else if (activeModuleIndex + 1 < course.modules.length) {
          const nextModule = course.modules[activeModuleIndex + 1];
          if (nextModule.lessons.length > 0) {
            const nextLesson = nextModule.lessons[0];
            selectLesson(nextLesson, nextModule, activeModuleIndex + 1, 0);
          }
        }
      }
    }, 100);
  };

  const isLiSelectable = (isCompleted: boolean, m, lesson, idx) => {
    const moduleInx = course!.modules.findIndex((mo) => mo.id === m.id);
    const previousModule = moduleInx > 0 && course!.modules[moduleInx - 1];
    let isLastLessonInPreviousModuleChecked;
    if (previousModule) {
      const lastLesson =
        previousModule.lessons[previousModule.lessons.length - 1];
      isLastLessonInPreviousModuleChecked =
        completedLessons.has(lastLesson.id) && m.lessons[0] === lesson;
    }
    return (
      isCompleted ||
      activeLesson?.id === lesson.id ||
      (idx > 0 && completedLessons.has(m.lessons[idx - 1].id)) ||
      isLastLessonInPreviousModuleChecked
    );
  };
  if (isAxiosError(error) && error!.status === 400) {
    toast.error("Access denied: You must enroll in this course to continue.", {
      duration: 1000,
      onAutoClose: () => {
        navigate(`/intern/home`);
      },
      onDismiss: () => {
        navigate(`/intern/home`);
      },
    });
  }

  if (isLoading || !course) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }
  // const isLastModule  = course && activeModuleIndex === course.modules.length - 1;
  // const isLastLesson  =
  //   isLastModule &&
  //   activeLessonIndex === course.modules[activeModuleIndex].lessons.length - 1;
  return (
    <div className="flex flex-col min-h-screen w-full">
      <CourseHeader
        userName={
          (useAuthStore.getState() as { user: { full_name: string } })?.user
            ?.full_name || "User"
        }
        pageTitle={course.title}
        canBeShowed={true}
        courseProgress={course?.enrollments?.[0]?.progress_percent}
      />

      {(course && !course.isEnrolled) || activeLesson === null ? (
        <>
          <h1>your are not enrolled in this course</h1>
        </>
      ) : (
        <div className="flex flex-col xl:flex-row min-h-[calc(100vh-80px)] w-full mt-2 lg:mt-4 bg-white">
          <style jsx global>{`
            .styled-checkbox {
              position: absolute;
              opacity: 0;
            }
            .styled-checkbox + span {
              position: relative;
              display: inline-block;
              width: 16px;
              height: 16px;
              background: white;
              border: 2px solid #ccc;
              border-radius: 2px;
            }
            .styled-checkbox:checked + span {
              background: #136a86;
              border-color: #136a86;
            }
            .styled-checkbox:checked + span::after {
              content: "";
              position: absolute;
              left: 4px;
              top: 1px;
              width: 4px;
              height: 8px;
              border: solid white;
              border-width: 0 2px 2px 0;
              transform: rotate(45deg);
            }
          `}</style>

          {/* Left Panel */}
          <div className="w-full xl:flex-grow xl:min-w-0 flex flex-col overflow-hidden bg-white">
            {/* Video Player Section */}
            <div className="relative w-full pb-[56.25%] h-0">
              {activeLesson.content_type === "video" ? (
                <div className="absolute inset-0 h-full">
                  <VideoPlayer
                    key={`video-${activeLesson.id}`} /* Key to force remount */
                    url={activeLesson.video_url!}
                    controls={true}
                    Boxheight="100%"
                    onProgress={handleVideoProgress}
                    onDuration={(duration: number) =>
                      setVideoDuration(duration)
                    }
                    autoPlay={canAutoPlay || true}
                    muted={true}
                  />
                  {nextCountdown !== null && (
                    <div className="absolute inset-0 font-sans bg-black/80 flex flex-col items-center justify-center cursor-pointer">
                      <span className="text-white text-lg font-semibold mb-2">
                        {activeLesson.order_position + 1}.{" "}
                        {
                          // Check if there is a next lesson in the current module
                          course.modules[activeModuleIndex]?.lessons[
                            activeLessonIndex + 1
                          ]?.title
                            ? course.modules[activeModuleIndex].lessons[
                              activeLessonIndex + 1
                            ].title
                            : // Else, check if there is a next module with at least one lesson
                            course.modules[activeModuleIndex + 1]?.lessons &&
                              course.modules[activeModuleIndex + 1].lessons
                                .length > 0
                              ? course.modules[activeModuleIndex + 1].lessons[0]
                                .title
                              : // Else, fallback
                              "No more lessons"
                        }
                      </span>
                      <span className="text-white text-lg font-semibold mb-2">
                        {nextCountdown}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNextCountdown(null);
                          doMoveToNextLesson();
                        }}
                        className="px-4 cursor-pointer py-2 bg-white text-black rounded"
                      >
                        Skip Now
                      </button>
                    </div>
                  )}
                </div>
              ) : activeLesson.content_type === "quiz" ? (
                <div className="absolute inset-0 bg-gray-100/60 overflow-y-auto">
                  <Quiz
                    quizz={activeLesson.quiz}
                    enrollmentId={course?.enrollments?.[0].id}
                    onStart={() => {
                      console.log("Quiz started, setting isQuizActive to true");
                      setQuizActive(true);
                    }}
                    onComplete={async () => {
                      console.log(
                        "Quiz completed, setting isQuizActive to false"
                      );
                      setQuizActive(false);
                      // Mark this lesson as completed
                      if (!completedLessons.has(activeLesson.id)) {
                        const newCompletedLessons = new Set(completedLessons);
                        newCompletedLessons.add(activeLesson.id);
                        setCompletedLessons(newCompletedLessons);
                        const lesson_progress_data = {
                          lesson_id: activeLesson.id,
                          slug: course.slug!,
                          completed_at: new Date().toISOString(),
                        };
                        await storeLessonProgress(lesson_progress_data);
                      }
                    }}
                    slug={course.slug}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gray-100/60 overflow-y-auto  overflow-x-hidden">
                  <div className="px-6 py-4 sm:px-10 sm:py-10 sm:pb-10 h-full">
                    <ReactQuill
                      value={DOMPurify.sanitize(activeLesson.lesson_text!) || ""}
                      theme="snow"
                      modules={{ toolbar: false }}
                      readOnly={true}
                      className="my-quill pb-12"
                    />
                  </div>


                </div>
              )}
              {!activeLesson.isCompleted &&
                !completedLessons.has(activeLesson.id) && activeLesson.content_type === "text" && (
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-white/90 to-transparent px-5 py-4 z-20">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={isNextLessonProgressLoading}
                        onClick={() => handleNextTextLesson()}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2
                                  cursor-pointer disabled:cursor-not-allowed disabled:opacity-75
                                  bg-[#136A86] hover:bg-[#5CB5BD]
                                  text-white sm:font-semibold lg:font-bold text-xs sm:text-sm xl:text-base
                                  rounded shadow-md transition-colors flex items-center gap-1 sm:gap-1.5`}
                      >
                        {isNextLessonProgressLoading && (
                          <Loader2 className="h-5 w-5 animate-spin text-white mr-2" />
                        )}
                        <span>Next</span>
                        <span className="hidden md:inline">Lesson</span>
                        <ChevronRight size={15} className="sm:w-4 md:w-5" />
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {/* Course Info Section */}
            <div className="px-4 py-5 md:px-5 md:py-3 space-y-3">
              <span className="bg-[#5CB5BD] text-[10px] px-2 py-1 max-w-fit font-bold text-white rounded-md">
                {course.categories.name}
              </span>

              <h1 className="text-xl sm:text-2xl md:text-[26px] font-bold mt-3">
                {course.title}
              </h1>
              <h2 className="font-normal -mt-1 mb-4 text-md ">
                {course.subtitle}
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <div className="border border-[#136A86] rounded-md w-fit px-3 h-[25px] flex items-center gap-2">
                  <NetworkSignal difficulty={course.difficulty} />

                  <span className="text-xs font-semibold capitalize text-[#136A86]">
                    {course.difficulty}
                  </span>
                </div>
                <p className="text-[#136A86] text-sm">
                  Created by <b>{course.user.full_name}</b>
                </p>
              </div>
              <div className="text-gray-600 text-xs flex flex-wrap gap-x-2  gap-y-2">
                <span className="flex items-center gap-1">
                  <Clock
                    size={12}
                    strokeWidth={2.5}
                    className="text-[#5CB5BD]"
                  />
                  {formatDuration(course.total_duration)}
                </span>
                <span className="hidden sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <Languages
                    size={12}
                    strokeWidth={2.5}
                    className="text-[#5CB5BD]"
                  />{" "}
                  English
                </span>
                <span className="hidden sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <Calendar
                    size={13}
                    strokeWidth={3}
                    className="text-[#5CB5BD]"
                  />{" "}
                  Last Updated 11/2023
                </span>
                <pre className=" hidden sm:inline">|</pre>
                <span className="flex items-center gap-1">
                  <User
                    height={12}
                    width={14}
                    strokeWidth={3.5}
                    className="text-[#5CB5BD]"
                  />
                  {course._count.enrollments} participants
                </span>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="flex-1 w-full overflow-hidden ">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <TabsList className="w-full grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3  h-10 sm:h-12 md:h-[48px] bg-white">
                  <TabsTrigger
                    value="overview"
                    className="uppercase py-2 xl:py-0 cursor-pointer text-xs sm:text-sm lg:text-base text-center text-[#136A86] w-full data-[state=active]:bg-[#136A86] data-[state=active]:text-white rounded-none h-full"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className="uppercase py-2 xl:py-0 cursor-pointer text-xs sm:text-sm lg:text-base text-center text-[#136A86] w-full data-[state=active]:bg-[#136A86] data-[state=active]:text-white rounded-none h-full"
                  >
                    Notes
                  </TabsTrigger>
                  <TabsTrigger
                    value="announcements"
                    className="uppercase py-2 xl:py-0 cursor-pointer text-xs sm:text-sm 2xl:text-base text-center text-[#136A86] w-full data-[state=active]:bg-[#136A86] data-[state=active]:text-white rounded-none h-full"
                  >
                    Announcements
                  </TabsTrigger>

                  {/* Content tab appears only on mobile */}
                  {isMobile && (
                    <TabsTrigger
                      value="content"
                      className="uppercase py-2 lg:py-0 text-xs sm:text-sm lg:text-base text-center text-[#136A86] w-full data-[state=active]:bg-[#136A86] data-[state=active]:text-white rounded-none h-full flex items-center justify-center gap-1"
                    >
                      {/* <BookOpen size={16} /> */}
                      <span>Content</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                <div className="flex-1 overflow-y-auto mt-8">
                  <TabsContent
                    value="overview"
                    className="h-full p-4 md:p-5 m-0"
                  >
                    <OverviewTab
                      description={course.description}
                      whatYouWillLearn={course.what_you_will_learn}
                      requirements={course.course_requirements}
                    />

                    <Instructor
                      instructor={{
                        full_name: course.user.full_name,
                        specialization: course.user.instructors.specialization,
                        description: course.user.instructors.description,
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="notes" className="h-full p-4 md:p-5">
                    <Notes
                      currentTime={currentTime}
                      noteMetaData={ActiveNoteMetadata}
                      notes={course.notes}
                    />
                  </TabsContent>
                  <TabsContent
                    value="announcements"
                    className="h-full p-4 md:p-5 m-0"
                  >
                    <Announcements
                      instructor={course.user}
                      announcements={course.announcements}
                    />
                  </TabsContent>

                  {/* Course content tab content - only shows on mobile */}
                  {isMobile && (
                    <TabsContent
                      value="content"
                      className="h-full p-0 m-0 overflow-hidden"
                    >
                      <div className="flex flex-col h-full">
                        <div className="p-3 bg-white border-b z-10 flex justify-between items-center">
                          <span className="font-bold">Course Content</span>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          <Accordion
                            value={openModuleValue} // ← valeur contrôlée
                            onValueChange={(val) =>
                              setOpenModuleValue(val || "")
                            }
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            {course.modules.map((m, index) => (
                              <AccordionItem
                                key={m.id}
                                value={`item-${index + 1}`}
                                className="border-none"
                              >
                                <AccordionTrigger className="p-3 font-semibold text-sm md:text-base text-black bg-[#F6F8FC] hover:no-underline cursor-pointer max-h-fit">
                                  <div className="flex flex-col items-start text-left w-full">
                                    <span className="text-[#262626] text-base font-bold line-clamp-1">
                                      {m.title}
                                    </span>
                                    <span className="flex items-center font-normal text-xs text-gray-600 gap-2">
                                      <Clock
                                        size={12}
                                        className="text-[#5CB5BD] flex-shrink-0"
                                      />
                                      <span>{formatDuration(m.duration)}</span>
                                      <span className="text-[#5CB5BD] font-bold">
                                        |
                                      </span>
                                      <span>
                                        {m.lessons.length} /{" "}
                                        {
                                          m.lessons.filter((lesson) =>
                                            completedLessons.has(lesson.id)
                                          ).length
                                        }
                                      </span>
                                    </span>
                                  </div>
                                </AccordionTrigger>

                                <AccordionContent>
                                  <ul className="space-y-3">
                                    {m.lessons.map((lesson, idx) => {
                                      const checkboxId = lesson.id.toString();
                                      const isCompleted = completedLessons.has(
                                        lesson.id
                                      );
                                      return (
                                        <li
                                          key={idx}
                                          onClick={() => {
                                            const isSelectable = isLiSelectable(
                                              isCompleted,
                                              m,
                                              lesson,
                                              idx
                                            );
                                            if (
                                              isQuizActive &&
                                              isSelectable &&
                                              activeLesson.id !== lesson.id
                                            ) {
                                              toast.info(
                                                "Please complete the current quiz before switching lessons.",
                                                { position: "top-center" }
                                              );
                                              return;
                                            }
                                            if (isSelectable) {
                                              handleLessonSelect(
                                                lesson.id,
                                                lesson.content_type
                                              );
                                            }
                                          }}
                                          className={`text-sm text-gray-800 hover:bg-gray-100 px-4 py-2.5 rounded-md transition group ${
                                            // Determine if this is the active lesson
                                            activeLesson.id === lesson.id
                                              ? "bg-gray-300 rounded-none" // Active lesson styling
                                              : ""
                                            } ${isLiSelectable(
                                              isCompleted,
                                              m,
                                              lesson,
                                              idx
                                            )
                                              ? "cursor-pointer" // Selectable lesson
                                              : "opacity-50 cursor-not-allowed" // Non-selectable lesson
                                            }`}
                                        >
                                          <div className="flex items-start gap-4 pt-1 min-w-0">
                                            <div className="flex-shrink-1">
                                              {isCompleted ? (
                                                <>
                                                  <input
                                                    id={checkboxId}
                                                    type="checkbox"
                                                    readOnly
                                                    checked={isCompleted}
                                                    className="styled-checkbox"
                                                  />
                                                  <span className="checkbox-mark"></span>
                                                </>
                                              ) : (
                                                <input
                                                  type="checkbox"
                                                  disabled
                                                  className={`h-4 w-4 text-teal-600/75 rounded border-gray-300 flex-shrink-0`}
                                                />
                                              )}
                                            </div>
                                            <div className="flex flex-col w-full -mt-1 items-start gap-2">
                                              <div className="flex gap-2 items-center min-w-0">
                                                <span className="truncate">
                                                  {lesson.title}
                                                </span>
                                              </div>
                                              <div className="flex items-center justify-end gap-2 text-[9px] sm:text-xs text-[#8C8FA5] flex-shrink-0">
                                                <>
                                                  <span className="flex-shrink-0 text-[#8C8FA5]">
                                                    {getLessonIcon(
                                                      lesson.content_type
                                                    )}
                                                  </span>
                                                  <span className="whitespace-nowrap text-[#8C8FA5]">
                                                    {formatDuration(
                                                      lesson.duration || 0
                                                    )}
                                                  </span>
                                                </>
                                              </div>
                                            </div>
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </div>
              </Tabs>
            </div>
          </div>

          {/* Right Panel - Sections - Only shown on desktop */}
          {!isMobile && (
            <div className="w-full xl:w-[416px] xl:min-w-[416px] xl:max-w-[416px] h-[calc(100vh-80px)] sticky top-0 overflow-hidden">
              <div className="bg-white border-t xl:border-t-0 border-gray-200 h-full flex flex-col">
                <div className="p-3 bg-white border-b border-gray-300 font-sans text-gray-800/95 z-10 flex justify-between items-center">
                  <span className="font-bold">Course Content</span>
                </div>

                <Accordion
                  type="single"
                  value={openModuleValue} // ← valeur contrôlée
                  onValueChange={(val) => setOpenModuleValue(val || "")}
                  collapsible
                  className="w-full"
                >
                  {course.modules.map((m, index) => (
                    <AccordionItem
                      key={m.id}
                      value={`item-${index + 1}`}
                      className="border-none"
                    >
                      <AccordionTrigger className="p-3 font-semibold text-sm md:text-base text-black bg-[#F6F8FC] hover:no-underline cursor-pointer">
                        <div className="flex flex-col items-start text-left w-full gap-2">
                          <span className="text-[#262626] font-bold line-clamp-1">
                            {m.title}
                          </span>
                          <span className="flex items-center font-normal text-xs text-gray-600 gap-2">
                            <Clock
                              size={12}
                              className="text-[#5CB5BD] flex-shrink-0 "
                            />
                            <span>{formatDuration(m.duration)}</span>
                            <span className="text-[#5CB5BD] font-bold">|</span>
                            <span>
                              {m.lessons.length} /{" "}
                              {
                                m.lessons.filter((lesson) =>
                                  completedLessons.has(lesson.id)
                                ).length
                              }
                            </span>
                          </span>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="">
                        <ul className="">
                          {m.lessons.map((lesson, idx) => {
                            const checkboxId = lesson.id.toString();
                            const isCompleted = completedLessons.has(lesson.id);
                            return (
                              <li
                                key={idx}
                                onClick={() => {
                                  const isSelectable = isLiSelectable(
                                    isCompleted,
                                    m,
                                    lesson,
                                    idx
                                  );
                                  if (
                                    isQuizActive &&
                                    isSelectable &&
                                    activeLesson.id !== lesson.id
                                  ) {
                                    toast.info(
                                      "Please complete the current quiz before switching lessons.",
                                      { position: "top-center" }
                                    );
                                    return;
                                  }
                                  if (isSelectable) {
                                    handleLessonSelect(
                                      lesson.id,
                                      lesson.content_type
                                    );
                                  }
                                }}
                                className={`text-sm text-gray-800 hover:bg-gray-100 px-4 py-2.5 rounded-md transition group ${
                                  // Determine if this is the active lesson
                                  activeLesson.id === lesson.id
                                    ? "bg-gray-300 rounded-none" // Active lesson styling
                                    : ""
                                  } ${isLiSelectable(isCompleted, m, lesson, idx)
                                    ? "cursor-pointer" // Selectable lesson
                                    : "opacity-50 cursor-not-allowed" // Non-selectable lesson
                                  }`}
                              >
                                <div className="flex items-start gap-4 pt-1 min-w-0">
                                  <div className="flex-shrink-1">
                                    {isCompleted ? (
                                      <>
                                        <input
                                          id={checkboxId}
                                          type="checkbox"
                                          readOnly
                                          checked={isCompleted}
                                          className="styled-checkbox"
                                        />
                                        <span className="checkbox-mark"></span>
                                      </>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        disabled
                                        className={`h-4 w-4 text-teal-600/75 rounded border-gray-300 flex-shrink-0`}
                                      />
                                    )}
                                  </div>
                                  <div className="flex flex-col w-full -mt-1 items-start gap-2">
                                    <div className="flex gap-2 items-center min-w-0">
                                      <span className="truncate">
                                        {lesson.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 text-[9px] sm:text-xs text-[#8C8FA5] flex-shrink-0">
                                      <>
                                        <span className="flex-shrink-0 text-[#8C8FA5]">
                                          {getLessonIcon(lesson.content_type)}
                                        </span>
                                        <span className="whitespace-nowrap text-[#8C8FA5]">
                                          {formatDuration(lesson.duration || 0)}
                                        </span>
                                      </>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
