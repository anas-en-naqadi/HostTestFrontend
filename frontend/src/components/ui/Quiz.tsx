import { useStoreQuizAttempt } from "@/lib/hooks/useStroreQuiz_attempts";
import { useState, useEffect, useRef } from "react";
import { navigate } from "@/lib/utils/navigator";
import { useResetCourseProgress } from "@/lib/hooks/useResetCourseProgress";
import { useAuthStore } from "@/store/authStore";
import { QuizType } from "@/types/quiz.types";
import { toast } from "sonner";
import { validateAnswers, AnswerSubmission } from "@/lib/api/validateAnswer";
import { useCreateCertificate } from "@/lib/hooks/useCreateCertificate";

// Type definitions for better type safety
interface QuizProps {
  quizz: QuizType;
  onComplete?: () => void;
  onStart?: () => void;
  slug: string;
  enrollmentId: number;
}

interface UserAnswer {
  questionId: number;
  optionId: number;
  isCorrect: boolean;
}

export default function Quiz({ quizz, onComplete, slug, onStart,enrollmentId }: QuizProps) {
  const [thisQuiz, setThisQuiz] = useState<QuizType>(quizz);
  const [currentScreen, setCurrentScreen] = useState<string>(
    thisQuiz.isQuizPassed ? "completed" : "start"
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isRestarted, setIsRestarted] = useState(false);
  const { mutateAsync: createCertificate, isPending: isCreatingCertificate } = useCreateCertificate();
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(thisQuiz.duration_time); // Default 5 minutes if not provided
  const [elapsedTime, setElapsedTime] = useState(0); // Time spent in seconds
  const [timerActive, setTimerActive] = useState(false);
  const { user } = useAuthStore();
  const { mutateAsync: resetUserCourseProgress, isPending } =
    useResetCourseProgress(slug);

  const prevTimerActiveRef = useRef(timerActive);
  const [startAt, setStartAt] = useState(new Date());
  const { mutateAsync: submitAttempt } = useStoreQuizAttempt(slug);

  // Reference to store the start time to precisely calculate elapsed time
  const startTimeRef = useRef<number | null>(null);

  const questions = thisQuiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Format elapsed time as MM:SS
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  useEffect(() => {
    if (quizz) {
      setThisQuiz({ ...quizz });
      // Using quizz directly instead of thisQuiz to log the current value
      console.log("received new quiz data", quizz);
      console.log(score);
    }
  }, [quizz]); // This effect runs when the quizz prop changes

  useEffect(() => {
    if (!thisQuiz) return;
    if (
      (!thisQuiz.isFinal &&
        thisQuiz.isQuizPassed &&
        thisQuiz.quiz_attempts &&
        thisQuiz.quiz_attempts.length === 1) ||
      (thisQuiz.isFinal &&
        !thisQuiz.isQuizPassed &&
        thisQuiz.quiz_attempts &&
        thisQuiz.quiz_attempts.length > 0) ||
      (thisQuiz.isFinal &&
        thisQuiz.isQuizPassed &&
        thisQuiz.quiz_attempts &&
        thisQuiz.quiz_attempts.length > 0)
    ) {
      setCurrentScreen("completed");
      let startTime = 0;
      let endTime = 0;
      if (!thisQuiz.isFinal) {
        setScore(thisQuiz.quiz_attempts[0].score);
        startTime = new Date(thisQuiz.quiz_attempts[0].started_at).getTime();
        endTime = new Date(thisQuiz.quiz_attempts[0].completed_at).getTime();
      } else {
        setScore(
          thisQuiz.quiz_attempts[thisQuiz.quiz_attempts.length - 1]?.score
        );
        startTime = new Date(
          thisQuiz.quiz_attempts[thisQuiz.quiz_attempts.length - 1].started_at
        ).getTime();
        endTime = new Date(
          thisQuiz.quiz_attempts[thisQuiz.quiz_attempts.length - 1].completed_at
        ).getTime();
      }
      setUserAnswers([]);
      setTimerActive(false);
      startTimeRef.current = null;
      // Calculate elapsed time from timestamps
      const timeSpentInSeconds = Math.floor((endTime - startTime) / 1000);
      setElapsedTime(timeSpentInSeconds > 0 ? timeSpentInSeconds : 0);
    } else {
      if (!isRestarted) {
        setCurrentScreen("start");
        setUserAnswers([]);
        setScore(0);
        setTimeLeft(thisQuiz.duration_time);
        setElapsedTime(0);
        setTimerActive(false);
        startTimeRef.current = null;
        setStartAt(new Date());
      }
    }
  }, [thisQuiz]);

  const hasTerminatedRef = useRef(false);
  const userAnswersRef = useRef<UserAnswer[]>([]);

  // Track cheat attempts for punishment
  const [cheatAttempts, setCheatAttempts] = useState(0);

  // Anti-cheat: Prevent keyboard shortcuts, copying, and other cheating methods
  useEffect(() => {
    // Only apply anti-cheat measures when in question mode
    if (currentScreen === "question") {
      // Function to handle keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        // Block common keyboard shortcuts
        if (
          // Prevent Ctrl+C (copy)
          (e.ctrlKey && e.key === "c") ||
          // Prevent Ctrl+V (paste)
          (e.ctrlKey && e.key === "v") ||
          // Prevent Ctrl+X (cut)
          (e.ctrlKey && e.key === "x") ||
          // Prevent Ctrl+F (find)
          (e.ctrlKey && e.key === "f") ||
          // Prevent Ctrl+P (print)
          (e.ctrlKey && e.key === "p") ||
          // Prevent Alt+Tab (switch windows)
          (e.altKey && e.key === "Tab") ||
          // === DEVTOOLS SHORTCUTS ===
          // F12 (universal DevTools)
          e.key === "F12" ||
          // Ctrl+Shift+I (Chrome, Edge, Firefox)
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
          // Ctrl+Shift+J (Chrome, Edge - JavaScript console)
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j") ||
          // Ctrl+Shift+C (Chrome, Edge, Firefox - element inspector)
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") ||
          // Ctrl+Shift+K (Firefox - web console)
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") ||
          // Ctrl+Shift+E (Firefox - network panel)
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") ||
          // Ctrl+Shift+M (Firefox - responsive design mode)
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") ||
          // Cmd+Option+I (Mac - Chrome, Safari)
          (e.metaKey && e.altKey && e.key.toLowerCase() === "i") ||
          // Cmd+Option+J (Mac - Chrome console)
          (e.metaKey && e.altKey && e.key.toLowerCase() === "j") ||
          // Cmd+Option+C (Mac - Chrome inspector)
          (e.metaKey && e.altKey && e.key.toLowerCase() === "c") ||
          // Cmd+Option+U (Mac - view source)
          (e.metaKey && e.altKey && e.key.toLowerCase() === "u") ||
          // Ctrl+U (view source)
          (e.ctrlKey && e.key.toLowerCase() === "u") ||
          // Ctrl+Shift+U (Chrome source panel)
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "u") ||
          // F10 (step over - debugger)
          e.key === "F10" ||
          // F11 (step into - debugger)
          e.key === "F11" ||
          // Shift+F11 (step out - debugger)
          (e.shiftKey && e.key === "F11") ||
          // Ctrl+` (Chrome, Edge - console in DevTools)
          (e.ctrlKey && e.key === "`") ||
          // Escape key when in certain contexts
          (e.key === "Escape" && currentScreen === "question") ||
          // PrintScreen
          e.key === "PrintScreen"
        ) {
          e.preventDefault();
          e.stopPropagation();
          toast.error("This action is not allowed during the quiz", {
            position: "top-center",
            duration: 2000,
          });
          return false;
        }
      };

      // Function to prevent context menu (right-click)
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        toast.error("Right-click is disabled during the quiz", {
          position: "top-center",
          duration: 2000,
        });
        return false;
      };

      // Function to prevent copy
      const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        toast.error("Copying is disabled during the quiz", {
          position: "top-center",
          duration: 2000,
        });
        return false;
      };

      // Function to handle visibility change (tab switching)
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          // Increment cheat attempts when user switches tabs
          setCheatAttempts((prev) => {
            const newCount = prev + 1;

            // First two attempts just show warnings
            if (newCount <= 2) {
              toast.error(
                `Warning: Leaving the quiz page is considered cheating (${newCount}/3)`,
                {
                  position: "top-center",
                  duration: 3000,
                }
              );
              return newCount; // Return updated count
            }
            // Third attempt triggers punishment
            else if (newCount >= 3) {
              // Reduce time by one minute (60 seconds) and update startTimeRef to reflect the penalty
              setTimeLeft((prev) => {
                const newTime = Math.max(0, prev - 60);
                // Adjust the start time reference to make the timer consistent with the penalty
                if (startTimeRef.current) {
                  startTimeRef.current =
                    Date.now() - (thisQuiz.duration_time - newTime) * 1000;
                }
                return newTime;
              });

              toast.error(
                "PENALTY: One minute has been deducted from your time due to repeated cheating attempts",
                {
                  position: "top-center",
                  duration: 5000,
                }
              );

              // Reset counter to start tracking again
              return 0;
            }

            return newCount; // Fallback (shouldn't reach here)
          });
        }
      };

      // Add all event listeners
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("contextmenu", handleContextMenu);

      document.addEventListener("copy", handleCopy);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Clean up event listeners when component unmounts or screen changes
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("contextmenu", handleContextMenu);

        document.removeEventListener("copy", handleCopy);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [currentScreen]); // Re-apply when screen changes

  // Update the ref whenever userAnswers changes
  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  const handleValidateAllAnswers = async (answers: UserAnswer[]) => {
    // 1️⃣ Prepare payload
    const answersPayload: AnswerSubmission[] = answers.map(a => ({
      questionId: a.questionId,
      optionId: a.optionId
    }));

    // 2️⃣ Call your validation API
    const validation = await validateAnswers(thisQuiz.id, answersPayload);
    // 3️⃣ Compute how many correct

    const correctCount = validation.results.filter(r => r.isCorrect).length;
    setScore(correctCount);
    // 4️⃣ Update userAnswers with correctness
    setUserAnswers(prev =>
      prev.map(ans => {
        const found = validation.results.find(r =>
          r.questionId === ans.questionId && r.optionId === ans.optionId
        );
        return { ...ans, isCorrect: found?.isCorrect ?? false };
      })
    );
    return correctCount;

  }
  // Timer logic with more precise elapsed time tracking
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (timerActive) {
      // Countdown timer
      timerId = setInterval(() => {
        // Update elapsed time based on precise start time
        const currentElapsedTime = Math.floor(
          (Date.now() - (startTimeRef.current || 0)) / 1000
        );
        setElapsedTime(currentElapsedTime);

        // Update countdown timer
        setTimeLeft((prevTime) => {
          if (prevTime <= 0 && !hasTerminatedRef.current) {
            hasTerminatedRef.current = true;
            clearInterval(timerId);
            // Time's up, submit current answers and end quiz
            setTimerActive(false);
            (async () => {
              try {

                // 5️⃣ Finally, call handleContinue just as if it were a manual submit
                handleContinue(await handleValidateAllAnswers(userAnswersRef.current), true);
              } catch (err) {
                console.error("Error validating on timeout:", err);
                // Fall back to continuing without validation
                handleContinue(0, true);
              }
            })();

            return 0;
          }

          return thisQuiz.duration_time - currentElapsedTime;
        });
      }, 100); // More frequent updates for smoother countdown
    }

    // Clean up timer
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerActive, thisQuiz.duration_time]);

  const handleStartQuiz = async () => {
    hasTerminatedRef.current = false;
    if (onStart) onStart();
    setLoading(true);
    try {
      const mockAttemptId = Math.floor(Math.random() * 10000);
      setAttemptId(mockAttemptId);

      // Reset timer values
      setTimeLeft(thisQuiz.duration_time);
      setElapsedTime(0);
      startTimeRef.current = Date.now();
      setUserAnswers([]);
      setCurrentQuestionIndex(0);
      setCurrentScreen("question");
      setTimerActive(true); // Start the timer
    } catch (error) {
      console.error("Failed to start quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage of correct answers
  const calculatePercentage = () => {
    return questions.length > 0
      ? Math.round((score / questions.length) * 100)
      : 0;
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || attemptId === null || !currentQuestion)
      return;

    // Store the answer locally without validation (we'll validate all at once later)
    const newAnswers: UserAnswer[] = [
      ...userAnswers,
      {
        questionId: currentQuestion.id,
        optionId: selectedOption,
        isCorrect: false // Placeholder value, will be updated after validation
      },
    ];
    setUserAnswers(newAnswers);

    // Move to next question without showing feedback
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Last question reached, validate all answers at once
      setLoading(true);
      try {

        setTimerActive(false);
        handleContinue(await handleValidateAllAnswers(newAnswers), false);

      } catch (error) {
        console.error("Failed to validate answers:", error);
        toast.error("Failed to validate your answers. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate how many stars to display (0-5 based on percentage)
  const calculateStars = () => {
    const percentage = calculatePercentage();
    if (percentage >= 90) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 70) return 3;
    if (percentage >= 50) return 2;
    if (percentage >= 30) return 1;
    return 0;
  };

  // Format the elapsed time for the completed screen
  const timeSpent = formatElapsedTime(elapsedTime);

  const handleContinue = (quizScore: number, isQuizTerminated: boolean) => {
    let quiz_attempt = {
      quiz_id: thisQuiz.id,
      started_at: startAt.toISOString(),
      completed_at: isQuizTerminated ? thisQuiz.duration_time : elapsedTime,
      score: quizScore,
      passed: true,
      slug: slug,
    };

    if (
      !thisQuiz.isFinal &&
      !thisQuiz.isQuizPassed &&
      thisQuiz.quiz_attempts?.length === 0
    ) {
      handleQuizAttemptSubmit(quiz_attempt);
      setCurrentScreen("completed");
      if (onComplete) {
        onComplete();
      }
    } else if (
      thisQuiz.isFinal &&
      !thisQuiz.isQuizPassed &&
      thisQuiz.quiz_attempts &&
      thisQuiz.quiz_attempts.length < 3
    ) {
      const quiz_percentage = Math.round(
        (quizScore / thisQuiz.questions.length) * 100
      );
      const new_quiz_attempt = {
        ...quiz_attempt,
        passed: quiz_percentage === 100,
      };
      // Check if this is the 3rd attempt and score is not 100%
      if (thisQuiz.quiz_attempts.length === 2 && quiz_percentage < 100) {
        // Submit the attempt first
        handleQuizAttemptSubmit(new_quiz_attempt);
        // Then reset progress after a short delay
        setTimeout(() => {
          setIsRestarted(true);
        navigate("/intern/my-learning");
           handleResetProgress();
        }, 2000);
      } else {
        handleQuizAttemptSubmit(new_quiz_attempt);
        setCurrentScreen("completed");
        if (quiz_percentage === 100) {
          if (onComplete) {
            onComplete();
        setTimeout(() => {
          (async () => {
            await createCertificate(enrollmentId);
            navigate("/intern/certificates");
          })();
        }, 500);
          }
        }
      }
    }
  };

  const handleQuizAttemptSubmit = async (quiz_attempt: any) => {
    await submitAttempt(quiz_attempt);
  };

  // Function to reset course progress and refetch data
  const handleResetProgress = async () => {
    if (!user || !slug) return;

    // Get user ID from the auth store
    const userId = user.id as number;
    if (!userId) {
      console.error("Cannot reset progress: User ID is missing");
      return;
    }

    try {
      // Reset progress for the current user on this course
      await resetUserCourseProgress(user.id!);
    } catch (error) {
      console.error("Failed to reset progress:", error);
    }
  };

  const handleRetryQuiz = () => {
    // Simply call handleStartQuiz to restart the quiz
    handleStartQuiz();
  };

  // Handle case when there are no questions
  if (questions.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        No questions available
      </div>
    );
  }

  const noSelectStyle: React.CSSProperties = {
    userSelect: "none", // typed as UserSelect
    WebkitUserSelect: "none", // vendor‐prefixed
    MozUserSelect: "none",
    msUserSelect: "none",
  };

  return (
    <div
      className="w-full min-h-full flex flex-col justify-center items-center bg-gray-100/60"
      style={noSelectStyle}
    >
      {/* Start Quiz Screen */}
      {currentScreen === "start" && (
        <div className="w-full h-full p-4 flex flex-col">
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-2 px-4">
            <h1 className="text-black text-xl font-extrabold sm:text-2xl md:text-4xl">
              {thisQuiz.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm mt-2 text-[#136A86]">
              <span>Quiz nº{thisQuiz.id}</span>
              <span className="text-black">|</span>
              <span>{questions.length} Questions</span>
              <span className="text-black">|</span>
              <span>Time: {formatTime(thisQuiz.duration_time)} </span>
            </div>
          </div>

          {!thisQuiz.isQuizPassed && quizz?.quiz_attempts?.length === 0 && (
            <div className="flex absolute justify-center sm:justify-end mt-4 bottom-4 right-4 px-4">
              <button
                onClick={handleStartQuiz}
                disabled={loading}
                className="text-white text-sm sm:text-[16px] bg-[#136A86] py-2 sm:py-3 px-6 sm:px-10 font-bold rounded-lg hover:bg-[#5CB5BD] transition-colors cursor-pointer shadow-md disabled:opacity-50 w-full sm:w-auto"
              >
                {loading ? "Starting..." : "Start Quiz"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Question Screen */}
      {currentScreen === "question" && currentQuestion && (
        <div className="w-full p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
          {/* Prominent Timer at the top */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div
              className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${timeLeft < 60
                ? "bg-red-100 border border-red-300"
                : "bg-[#eaf5f7] border border-[#5CB5BD]"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 sm:h-5 sm:w-5 ${timeLeft < 60 ? "text-red-500" : "text-[#136A86]"
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                className={`text-sm sm:text-base font-bold ${timeLeft < 60 ? "text-red-500" : "text-[#136A86]"
                  }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 w-full mb-2 sm:mb-0">
              <p className="text-[#136A86] text-xs sm:text-sm md:text-base font-medium text-center sm:text-left">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="bg-gray-200 h-2 w-full sm:w-1/2 rounded-full overflow-hidden">
              <div
                className="bg-[#136A86] h-full rounded-full"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-3 sm:mb-4 md:mb-6">
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800">
              {currentQuestion.text}
            </h1>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors group ${selectedOption === option.id
                  ? "border-[#5CB5BD]"
                  : "border-black"
                  } hover:border-[#5CB5BD]`}
                onClick={() => setSelectedOption(option.id)}
              >
                <input
                  type="radio"
                  name="quizOption"
                  id={`option-${option.id}`}
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                  className="appearance-none w-4 h-4 sm:w-5 sm:h-5 border-2 border-black rounded-full 
                    checked:bg-[#5CB5BD] checked:border-[#5CB5BD]
                    focus:ring-2 focus:ring-offset-2 focus:ring-[#5CB5BD] cursor-pointer
                    group-hover:border-[#5CB5BD] transition-colors"
                />
                <label
                  htmlFor={`option-${option.id}`}
                  className="text-xs sm:text-sm md:text-base text-gray-700 cursor-pointer flex-1"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </div>

          {/* Submit Answer button */}
          <div className="flex justify-center sm:justify-end mt-4 sm:mt-6 md:mt-8">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || loading}
              className={`bg-[#136A86] text-white font-bold py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-lg ${selectedOption === null || loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#5CB5BD] cursor-pointer"
                } transition-colors shadow-md active:scale-95 transform w-full sm:w-auto text-sm sm:text-base`}
            >
              {loading
                ? "Submitting..."
                : "Submit Answer"}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Completed Screen */}
      {currentScreen === "completed" && (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-center items-center lg:px-10 2xl:px-30">
          {/* Timer finished indicator */}
          <div className="flex items-center justify-center mb-4 pt-10 md:-mt- lg:-mt-10">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${(thisQuiz.isFinal && calculatePercentage() === 100) ||
                  (!thisQuiz.isFinal && thisQuiz.isQuizPassed)
                  ? "text-green-600"
                  : thisQuiz.isFinal &&
                    calculatePercentage() < 100 &&
                    thisQuiz?.quiz_attempts?.length! >= 3
                    ? "text-red-600"
                    : "custom-blue"
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    (thisQuiz.isFinal && calculatePercentage() === 100) ||
                      (!thisQuiz.isFinal)
                      ? "M5 13l4 4L19 7" // Success checkmark
                      : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" // Warning triangle
                  }
                />
              </svg>
              {thisQuiz.isFinal ? (
                <span
                  className={`text-base font-medium ${calculatePercentage() === 100
                    ? "text-green-600"
                    : thisQuiz.quiz_attempts &&
                      thisQuiz.quiz_attempts.length >= 3 &&
                      !thisQuiz.isQuizPassed
                      ? "text-red-600"
                      : "custom-blue"
                    }`}
                >
                  {calculatePercentage() === 100 || thisQuiz.isQuizPassed
                    ? "Quiz Passed"
                    : thisQuiz.quiz_attempts &&
                      thisQuiz.quiz_attempts.length >= 3 &&
                      !thisQuiz.isQuizPassed
                      ? "You Failed the Quiz"
                      : "Quiz Attempted "}
                </span>
              ) : (
                <span className="text-base font-medium text-green-600">
                  Quiz Completed
                </span>
              )}
            </div>
          </div>

          <div className="text-left space-y-6 w-full max-w-full h-full">
            {/* Star Rating and Feedback Container - Consistent alignment */}
            <div className="text-center sm:text-start md:text-left">
              {/* Star Rating - Matches alignment of feedback text */}
              <div className="flex justify-center md:justify-start space-x-2 mb-4">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${index < calculateStars()
                      ? "text-amber-500 fill-current"
                      : "text-gray-400/90 fill-current"
                      }`}
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>

              {/* Feedback message - Same alignment as stars */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#136A86]">
                {thisQuiz.isFinal
                  ? // Final quiz messages
                  calculatePercentage() === 100
                    ? "Congratulations!"
                    : "Quiz Incomplete"
                  : // Regular quiz messages (keep as is)
                  calculatePercentage() >= 90
                    ? "Excellent job!"
                    : calculatePercentage() >= 70
                      ? "Great job!"
                      : calculatePercentage() >= 50
                        ? "Good job!"
                        : "Keep practicing!"}
              </h2>
              <p className="text-gray-700 mt-1 text-sm sm:text-base max-w- mx-auto 2xl:mx-0">
                {thisQuiz.isFinal ? (
                  // Final quiz messages
                  calculatePercentage() === 100 && thisQuiz.isQuizPassed ? (
                    "You have successfully completed the final quiz and the course, you will be redirected to the certificates page!"
                  ) : (
                    <>
                      {thisQuiz.quiz_attempts &&
                        thisQuiz.quiz_attempts.length < 3 && (
                          <>
                            You need to answer all questions correctly to
                            complete the course.
                            <span className="block mt-1">
                              You have {3 - thisQuiz.quiz_attempts.length}{" "}
                              attempt
                              {3 - thisQuiz.quiz_attempts.length !== 1
                                ? "s"
                                : ""}{" "}
                              remaining.
                            </span>
                          </>
                        )}
                      {thisQuiz.quiz_attempts &&
                        thisQuiz.quiz_attempts.length >= 3 &&
                        thisQuiz.quiz_attempts[
                          thisQuiz.quiz_attempts.length - 1
                        ].passed === false && (
                          <>
                            You did not answer all questions correctly.
                            <span className="block mt-1 text-red-600 font-medium">
                              You've used all attempts. the course is
                              restarting...
                            </span>
                          </>
                        )}
                    </>
                  )
                ) : (
                  // Regular quiz messages (keep as is)
                  <>
                    {calculateStars() >= 3
                      ? "You are ready to move on to the next lecture."
                      : "Try again to unlock the next lecture."}
                  </>
                )}
                <span className="block mt-1 text-xs text-gray-500">
                  {calculatePercentage()}% correct answers
                </span>
              </p>
            </div>


            {/* Score and Time section */}
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-8 mb-4">
              {/* Score section */}
              <div className="text-center w-full sm:w-auto">
                <p className="text-black text-sm">You got</p>
                <div className="relative w-20 h-20 mx-auto my-2">
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke={
                        thisQuiz.isFinal && calculatePercentage() !== 100 && !thisQuiz.isQuizPassed && thisQuiz?.quiz_attempts && thisQuiz?.quiz_attempts?.length > 0
                          ? "#ef4444"
                          : "#5CB5BD"
                      }
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 *
                        Math.PI *
                        45 *
                        (1 -
                          (questions.length > 0 ? score / questions.length : 0))
                        }`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xl font-bold">
                      {score}
                      <span className="text-black font-extrabold text-xs">
                        /
                      </span>
                      <span className="text-black font-semibold text-sm">
                        {questions.length}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-black text-sm">correct</p>
              </div>

              {/* Time section */}
              <div className="text-center w-full sm:w-auto">
                <p className="text-black text-sm">You took</p>
                <div className="my-2">
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-extrabold">
                      {timeSpent.minutes}
                    </span>
                    <span className="text-black text-xs ml-1">min</span>
                    <span className="text-2xl font-extrabold ml-2">
                      {timeSpent.seconds}
                    </span>
                    <span className="text-black text-xs ml-1">s</span>
                  </div>
                </div>
                <p className="text-black text-sm">to complete the quiz</p>
              </div>

              {/* Retry button - Show only when quiz is not passed and attempts <= 2 */}
              {thisQuiz.isFinal &&
                !thisQuiz.isQuizPassed &&
                thisQuiz.quiz_attempts &&
                thisQuiz.quiz_attempts.length >= 1 &&
                thisQuiz.quiz_attempts.length <= 2 && (
                  <div className="flex absolute justify-center sm:justify-end mt-4 bottom-4 right-4 px-4">
                    <button
                      type="button"
                      disabled={thisQuiz.isQuizPassed || isPending}
                      className={`bg-red-500 text-white font-bold py-3 px-6 sm:py-3 sm:px-8 ${thisQuiz.isQuizPassed || isPending
                        ? "cursor-not-allowed opacity-75"
                        : "cursor-pointer"
                        } rounded-lg hover:bg-red-600 transition-colors shadow-sm w-full sm:w-auto`}
                      onClick={handleRetryQuiz}
                    >
                      {isPending
                        ? "Please wait..."
                        : `Retry Quiz (${thisQuiz.quiz_attempts.length + 1}/3)`}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
