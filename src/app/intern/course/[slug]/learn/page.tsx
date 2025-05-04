"use client";

import Image from "next/image";
import VideoPlayer from "@/components/ui/VideoPlayer";
import Quiz from "@/components/ui/Quiz";
import { useParams } from "next/navigation";
import parse from "html-react-parser";
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
  // BookOpen,
} from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { useState, useEffect } from "react";
import Notes from "./Notes";
import { Note } from "@/types/notes.types";
import Announcements from "./Annoucements";
import { useAuthStore } from "@/store/authStore";
import { useFetchCourseToLearn } from "@/lib/hooks/course/useFetchCourseToLearn";
import { LearnDetailResponse } from "@/types/course.types";
import Spinner from "@/components/common/spinner";
import { useStoreLessonProgress } from "@/lib/hooks/useStoreLessonProgress";




export default function CourseLearningPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, isLoading } = useFetchCourseToLearn(slug);

  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTime, setCurrentTime] = useState(0);
  const [ActiveNoteMetadata, setActiveNoteMetadata] = useState({
    activeLessonTitle: "", // Default value
    activeModuleTitle: "", // Default value
    lessonId: 0,
    moduleOrderPosition: 0,
    lessonOrderPosition: 0,
  });
  const [videoDuration, setVideoDuration] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);
  const [course, setCourse] = useState<LearnDetailResponse>();
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [canAutoPlay, setCanAutoPlay] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [openModuleValue, setOpenModuleValue] = useState<string>(
    `item-${activeModuleIndex + 1}`
  );
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);
  const { mutateAsync: storeLessonProgress } =
    useStoreLessonProgress(course?.slug || ""); // 3️⃣ Wishlist mutations

  // Kick off a 5-second countdown whenever doMoveToNextLesson is called
  const scheduleNextLesson = () => {
    setNextCountdown(5);
  };

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
      setCourse(data);
    }
  }, [data]);

  // Then handle lesson selection when course changes
  useEffect(() => {
    if (!course) return;
    const fetchedCompletedLessons = new Set();

    if (course) {
      course.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          // Check if lesson is completed
          if (lesson.isCompleted) {
            fetchedCompletedLessons.add(lesson.id); // Store IDs, not objects
          }
        });
      });
      setCompletedLessons(fetchedCompletedLessons);
    }
    
    if (course.modules && course.modules.length > 0) {
      // Check if user is enrolled and has a last accessed lesson
      if (
        course.isEnrolled &&
        Array.isArray(course.enrollments) &&
        course.enrollments.length > 0
      ) {
        const lastAccessed = course.enrollments[0]; // Get the first enrollment
        const lastModuleId = lastAccessed.last_accessed_module_id;
        const lastLessonId = lastAccessed.last_accessed_lesson_id;
  
        // Find module and lesson indices
        const moduleIndex = course.modules.findIndex(
          (m) => m.id === lastModuleId
        );
  
        if (moduleIndex !== -1) {
          const thisModule = course.modules[moduleIndex];
          const lessonIndex = thisModule.lessons.findIndex(
            (l) => l.id === lastLessonId
          );
  
          if (lessonIndex !== -1) {
            // Get the next lesson (either in current module or first lesson in next module)
            let nextLesson = null;
            let nextModule = thisModule;
            let nextModuleIndex = moduleIndex;
            let nextLessonIndex = lessonIndex;
  
            // Check if there's a next lesson in the current module
            if (lessonIndex < thisModule.lessons.length - 1 ) {
              // Next lesson in the same module
              nextLesson = thisModule.lessons[lessonIndex + 1];
              nextLessonIndex = lessonIndex + 1;
            } else if (moduleIndex < course.modules.length - 1 ) {
              // First lesson in the next module
              nextModule = course.modules[moduleIndex + 1];
              nextModuleIndex = moduleIndex + 1;
              
              if (nextModule.lessons.length > 0) {
                nextLesson = nextModule.lessons[0];
                nextLessonIndex = 0;
              }
            }
  
            if (fetchedCompletedLessons.size > 0 && nextLesson && !completedLessons.has(nextLesson.id)) {
              console.log("Moving to next lesson:", nextLesson);
              setActiveLesson(nextLesson);
              selectLesson(nextLesson, nextModule, nextModuleIndex, nextLessonIndex);
            } else {
              let currentLesson = null;
              // Stay on current lesson if no next lesson found or already completed
              if(thisModule !== course.modules[0]) {
                currentLesson =  course.modules[0].lessons[lessonIndex]
              }else{
                currentLesson = thisModule.lessons[lessonIndex];

              }
              console.log("Staying on last accessed lesson:", currentLesson);
              setActiveLesson(currentLesson);
              selectLesson(currentLesson, thisModule, moduleIndex, lessonIndex);
            }
          }
        }
      }
    }
  }, [course]);
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

  // Single function to handle all video tracking scenarios
  const handleVideoProgress = async ({
    playedSeconds,
    played,
  }: {
    playedSeconds: number;
    played: string;
  }) => {
    setCurrentTime(playedSeconds);
    // Only proceed if we have an active lesson and know the video duration
    if (activeLesson && videoDuration > 0) {
      const lessonId = activeLesson.id;

      // Check if we're at least at (duration - 5 seconds)
      if (videoDuration - playedSeconds <= 5) {
        // Mark as completed if not already in our completed set
        if (!completedLessons.has(lessonId)) {
          const newCompletedLessons = new Set(completedLessons);
          newCompletedLessons.add(lessonId);
          setCompletedLessons(newCompletedLessons);

          
          await handleStoreProgress(lessonId);
        }
      }
      if (playedSeconds === videoDuration) {
        moveToNextLesson();
      }
    }
  };

  async function handleStoreProgress(id:number)  {
    const lesson_progress_data = {
      lesson_id: id,
      slug: course.slug!,
      completed_at: new Date().toISOString(),
    };
    console.log(lesson_progress_data)
    await storeLessonProgress(lesson_progress_data);
  }
  // Function to move to the next lesson
  const doMoveToNextLesson = () => {
    console.log("Moving to next lesson");

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
      setCanAutoPlay(true);
    }
  };
  // And change your original moveToNextLesson to just schedule:
  const moveToNextLesson = () => {
    scheduleNextLesson();
  };
  // Function to select a lesson
  const selectLesson = (
    lesson,
    module,
    moduleIndex: number,
    lessonIndex: number
  ) => {
    setActiveLesson(lesson);
    setActiveModuleIndex(moduleIndex);
    setActiveLessonIndex(lessonIndex);
    setOpenModuleValue(`item-${moduleIndex + 1}`);
    // Handle selection logic
    handleLessonSelect(
      lesson.title,
      module.title,
      lesson.id,
      module.order_position,
      lesson.order_position
    );
  };

  // Modify your handleLessonSelect function to update active lesson state
  const handleLessonSelect =  (
    activeLessonTitle,
    activeModuleTitle,
    lessonId,
    moduleOrderPosition,
    lessonOrderPosition
  ) => {
    setActiveNoteMetadata({
      activeLessonTitle,
      activeModuleTitle,
      lessonId,
      moduleOrderPosition,
      lessonOrderPosition,
    });

    // Find the module and lesson by ID
    const moduleIdx = course.modules.findIndex((m) =>
      m.lessons.some((l) => l.id === lessonId)
    );

    if (moduleIdx !== -1) {
      const lessonIdx = course.modules[moduleIdx].lessons.findIndex(
        (l) => l.id === lessonId
      );

      if (lessonIdx !== -1) {
        setActiveLesson(course.modules[moduleIdx].lessons[lessonIdx]);
        setActiveModuleIndex(moduleIdx);
        setActiveLessonIndex(lessonIdx);
        const lesson = course.modules[moduleIdx].lessons[lessonIdx];
          if (lesson.content_type === "text") {
            if (course && !completedLessons.has(lesson.id)) {
             handleStoreProgress(lesson.id)
            }
            setCompletedLessons(new Set([...completedLessons, lesson.id]));
          }
          
        
      }
    }
  };

  if (isLoading || !course) {
    return (
      <div className="w-full h-screen relative">
        <div className="top-[40%] right-[49%] absolute">
          <Spinner />
        </div>
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
        courseProgress={course.enrollments[0].progress_percent}
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
                <div className="absolute inset-0">
                  <VideoPlayer
                    url={activeLesson.video_url!}
                    controls={true}
                    onProgress={handleVideoProgress}
                    onDuration={(duration: number) =>
                      setVideoDuration(duration)
                    }
                    autoPlay={canAutoPlay}
                    muted={true}
                  />
                  {nextCountdown !== null && (
                    <div
                      className="absolute inset-0 font-sans bg-black/65 flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => {
                        setNextCountdown(null);
                        doMoveToNextLesson();
                      }}
                    >
                      <span className="text-white text-lg font-semibold mb-2">
                        {activeLesson.order_position + 1}. {activeLesson.title}
                      </span>
                      <span className="text-white text-lg font-semibold mb-2">
                        {nextCountdown}
                      </span>
                      <button className="px-4 py-2 bg-white text-black rounded">
                        Skip Now
                      </button>
                    </div>
                  )}
                </div>
              ) : activeLesson.content_type === "quiz" ? (
                <div className="absolute inset-0 bg-gray-100/60 overflow-y-auto">
                  <Quiz
                    quizz={activeLesson.quiz}
                    onComplete={async() => {
                      // Mark this lesson as completed
                    if(!completedLessons.has(activeLesson.id)){
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
                      // Move to the next lesson
                      doMoveToNextLesson();
                    }}
                    slug={course.slug}
                  />
                </div>
              ) :  (
                <div className="absolute inset-0 bg-gray-100/60 px-18 py-15 overflow-y-scroll">
                  {parse(DOMPurify.sanitize(activeLesson.lesson_text!))}
                </div>
              )}
            { 
//  isLastLesson &&
//   (
//     <div className="absolute inset-0 bg-gray-100/60 px-8 py-6 overflow-y-auto">
//       🎉 Congratulations, you’ve finished the course!
//     </div>
//   )
}
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
                  <Image
                    src="/network-signal.svg"
                    alt="network signal"
                    width={10}
                    height={10}
                  />
                  <span className="text-xs font-semibold text-[#136A86]">
                    {course.difficulty}
                  </span>
                </div>
                <p className="text-[#136A86] text-sm">
                  Created by <b>{course.instructors.users.full_name}</b>
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
                        full_name: course.instructors.users.full_name,
                        specialization: course.instructors.specialization,
                        description: course.instructors.description,
                        avatar_url: course.instructors.users.full_name, // Optional
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
                      instructor={course.instructors}
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
                            {course.modules.map((module, index) => (
                              <AccordionItem
                                key={module.id}
                                value={`item-${index + 1}`}
                                className="border-none"
                              >
                                <AccordionTrigger className="p-3 font-semibold text-sm md:text-base text-black bg-[#F6F8FC] hover:no-underline cursor-pointer max-h-fit">
                                  <div className="flex flex-col items-start text-left w-full">
                                    <span className="text-[#262626] text-base font-bold line-clamp-1">
                                      {module.title}
                                    </span>
                                    <span className="flex items-center font-normal text-xs text-gray-600 gap-2 ml-3">
                                      <Clock
                                        size={12}
                                        className="text-[#5CB5BD] flex-shrink-0 -mt-1"
                                      />
                                      <span>
                                        {formatDuration(module.duration)}
                                      </span>
                                      <span className="text-[#5CB5BD] font-bold">
                                        |
                                      </span>
                                      <span>
                                        {module.lessons.length} /{" "}
                                        {
                                          module.lessons.filter((lesson) =>
                                            completedLessons.has(lesson.id)
                                          ).length
                                        }
                                      </span>
                                    </span>
                                  </div>
                                </AccordionTrigger>

                                <AccordionContent>
                                  <ul className="space-y-3">
                                    {module.lessons.map((lesson, idx) => {
                                      const checkboxId = lesson.id.toString();
                                      const isCompleted = completedLessons.has(
                                        lesson.id
                                      );
                                      return (
                                        <li
                                          key={idx}
                                          onClick={() => {
                                            const lastCheckedLesson =
                                              idx > 0 &&
                                              completedLessons.has(
                                                module.lessons[idx - 1].id
                                              );
                                            const condition =
                                              !isCompleted &&
                                              activeLesson.id !== lesson.id &&
                                              !lastCheckedLesson;
                                            if (condition) {
                                              return;
                                            }
                                            return handleLessonSelect(
                                              lesson.title,
                                              module.title,
                                              lesson.id,
                                              module.order_position,
                                              lesson.order_position
                                            );
                                          }}
                                          className={`text-sm text-gray-800 hover:bg-gray-100 px-4 py-2.5 rounded-md transition group cursor-pointer ${
                                            activeLesson.id === lesson.id &&
                                            "bg-gray-300 rounded-none"
                                          } ${
                                            !isCompleted &&
                                            activeLesson.id !== lesson.id &&
                                            "opacity-80"
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
                                            <div className=" flex flex-col w-full -mt-1 items-start gap-2">
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
            <div className="w-full xl:w-[416px] xl:min-w-[416px] xl:max-w-[416px] xl:h-auto overflow-y-auto bg-white border-t xl:border-t-0 border-gray-200">
              <div className="p-3 sticky top-0 bg-white border-b border-gray-300 font-sans text-gray-800/95 z-10 flex justify-between items-center">
                <span className="font-bold">Course Content</span>
              </div>

              <Accordion
                type="single"
                value={openModuleValue} // ← valeur contrôlée
                onValueChange={(val) => setOpenModuleValue(val || "")}
                collapsible
                className="w-full"
              >
                {course.modules.map((module, index) => (
                  <AccordionItem
                    key={module.id}
                    value={`item-${index + 1}`}
                    className="border-none"
                  >
                    <AccordionTrigger className="p-3 font-semibold text-sm md:text-base text-black bg-[#F6F8FC] hover:no-underline cursor-pointer">
                      <div className="flex flex-col items-start text-left w-full gap-2">
                        <span className="text-[#262626] font-bold line-clamp-1">
                          {module.title}
                        </span>
                        <span className="flex items-center font-normal text-xs text-gray-600 gap-2 ml-3">
                          <Clock
                            size={12}
                            className="text-[#5CB5BD] flex-shrink-0 -mt-1"
                          />
                          <span>{formatDuration(module.duration)}</span>
                          <span className="text-[#5CB5BD] font-bold">|</span>
                          <span>
                            {module.lessons.length} /{" "}
                            {
                              module.lessons.filter((lesson) =>
                                completedLessons.has(lesson.id)
                              ).length
                            }
                          </span>
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="">
                      <ul className="">
                        {module.lessons.map((lesson, idx) => {
                          const checkboxId = lesson.id.toString();
                          const isCompleted = completedLessons.has(lesson.id);
                          return (
                            <li
                              key={idx}
                              onClick={() => {
                                const lastCheckedLesson =
                                  idx > 0 &&
                                  completedLessons.has(
                                    module.lessons[idx - 1].id
                                  );
                                const condition =
                                  !isCompleted &&
                                  activeLesson.id !== lesson.id &&
                                  !lastCheckedLesson;
                                if (condition) {
                                  return;
                                }
                                return handleLessonSelect(
                                  lesson.title,
                                  module.title,
                                  lesson.id,
                                  module.order_position,
                                  lesson.order_position
                                );
                              }}
                              className={`text-sm text-gray-800 hover:bg-gray-100 px-4 py-2.5 rounded-md transition group cursor-pointer ${
                                activeLesson.id === lesson.id &&
                                "bg-gray-300 rounded-none"
                              } ${
                                !isCompleted &&
                                activeLesson.id !== lesson.id &&
                                "opacity-80"
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
                                <div className=" flex flex-col w-full -mt-1 items-start gap-2">
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
          )}
        </div>
      )}
    </div>
  );
}
