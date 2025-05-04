import { useStoreQuizAttempt } from "@/lib/hooks/useStroreQuiz_attempts";
import { useState, useEffect, useRef } from 'react';

// Type definitions for better type safety
interface Option {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  quiz_id: number;
  text: string;
  options: Option[];
}

interface QuizAttempt {
  id: number;
  score: number;
  started_at: string;
  completed_at: string;
  passed: boolean;
}

interface Quiz {
  id: number;
  title: string;
  created_by: number;
  isQuizPassed: boolean;
  duration_time: number; // in seconds
  questions: Question[];
  quiz_attempts?: QuizAttempt[]; // Added quiz_attempts property
}

interface QuizProps {
  quizz: Quiz;
  onComplete?: () => void;
  slug:string;
}

interface UserAnswer {
  questionId: number;
  optionId: number;
  isCorrect: boolean;
}

export default function Quiz({ quizz, onComplete,slug }: QuizProps) {
  // Handle case when quizz is undefined or null
 
  const [currentScreen, setCurrentScreen] = useState("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(quizz.duration_time || 300); // Default 5 minutes if not provided
  const [elapsedTime, setElapsedTime] = useState(0); // Time spent in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [startAt, setStartAt] = useState(new Date());
  const { mutateAsync: submitAttempt, isLoading } = useStoreQuizAttempt(slug);

  // Reference to store the start time to precisely calculate elapsed time
  const startTimeRef = useRef<number | null>(null);

  const questions = quizz.questions || [];
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
    console.log(quizz)
    if (quizz && quizz.isQuizPassed && quizz.quiz_attempts) {
      setCurrentScreen("completed");
      setScore(quizz.quiz_attempts[0].score);
      console.log("score",quizz.quiz_attempts[0].score)
      // Calculate elapsed time from timestamps
      const startTime = new Date(quizz.quiz_attempts[0].started_at).getTime();
      const endTime = new Date(quizz.quiz_attempts[0].completed_at).getTime();
      const timeSpentInSeconds = Math.floor((endTime - startTime) / 1000);
      setElapsedTime(timeSpentInSeconds > 0 ? timeSpentInSeconds : 0);
      console.log("elapsedTime",elapsedTime);
    }
  }, [quizz,currentScreen,elapsedTime]);

  useEffect(() => {
    // Initialize quiz attempt when starting
    if (currentScreen === "start") {
      setUserAnswers([]);
      setScore(0);
      setTimeLeft(quizz.duration_time || 300);
      setElapsedTime(0);
      setTimerActive(false);
      startTimeRef.current = null;
      setStartAt(new Date());
    }
  }, [currentScreen, quizz.duration_time]);

  // Timer logic with more precise elapsed time tracking
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (timerActive) {
      // Set start time if not already set
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }

      // Countdown timer
      timerId = setInterval(() => {
        // Update elapsed time based on precise start time
        const currentElapsedTime = Math.floor(
          (Date.now() - (startTimeRef.current || 0)) / 1000
        );
        setElapsedTime(currentElapsedTime);

        // Update countdown timer
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Time's up, submit current answers and end quiz
            setTimerActive(false);
            setCurrentScreen("completed");

            // Calculate final score with current answers
            const correctAnswers = userAnswers.filter(
              (answer) => answer.isCorrect
            ).length;
            setScore(correctAnswers);

            return 0;
          }
          return (quizz.duration_time || 300) - currentElapsedTime;
        });
      }, 100); // More frequent updates for smoother countdown
    }

    // Clean up timer
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerActive, quizz.duration_time, userAnswers]);

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would create a quiz attempt in the database
      // and get back an attemptId
      // For now, we'll mock this with a random ID
      const mockAttemptId = Math.floor(Math.random() * 10000);
      setAttemptId(mockAttemptId);

      // Reset timer values
      setTimeLeft(quizz.duration_time || 300);
      setElapsedTime(0);
      startTimeRef.current = Date.now();

      setCurrentScreen("question");
      setTimerActive(true); // Start the timer
    } catch (error) {
      console.error("Failed to start quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || attemptId === null || !currentQuestion) return;

    setLoading(true);
    try {
      // Find the selected option to determine if it's correct
      const selectedOptionData = currentQuestion.options.find(
        (opt) => opt.id === selectedOption
      );
      const isCorrect = selectedOptionData
        ? selectedOptionData.is_correct
        : false;

      // Store the answer locally
      const newAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        optionId: selectedOption,
        isCorrect,
      };

      setUserAnswers([...userAnswers, newAnswer]);

      // Move to next question without showing feedback
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
      } else {
        // Stop the timer
        setTimerActive(false);

        // Calculate final score
        const correctAnswers =
          userAnswers.filter((answer) => answer.isCorrect).length +
          (isCorrect ? 1 : 0);
        setScore(correctAnswers);
        setCurrentScreen("completed");
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = () => {
    return questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
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

  const handleContinue = () => {
   if(!quizz.isQuizPassed && quizz.quiz_attempts.length === 0){
    const quiz_attempt = {
      quiz_id: quizz.id,
      started_at: startAt.toISOString(), // ISO timestamp, e.g. new Date().toISOString()
      completed_at: elapsedTime,
      score: score,
      passed: true,
      slug:slug
    };
    submitAttempt(quiz_attempt).then((res) => {
      if (res && res.status === 201) {
        
      }
    }).catch(error => {
      console.error("Failed to submit attempt:", error);
    });
   }
   setCurrentScreen("completed");

   if (onComplete) {
    onComplete();
  }

  };

  // // If quiz is already passed, show completed screen directly
  // useEffect(() => {
  //   if (quizz.isQuizPassed && currentScreen === "start") {
  //     // If quiz is already passed, switch to completed screen
  //     setCurrentScreen("completed");

  //     // Set a default good score since quiz was already passed
  //     const defaultScore = Math.ceil(questions.length * 0.7); // 70% score as default
  //     setScore(defaultScore);
  //   }
  // }, [quizz.isQuizPassed, questions.length, currentScreen]);

  // Handle case when there are no questions
  if (questions.length === 0) {
    return <div className="w-full h-full flex justify-center items-center">No questions available</div>;
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-gray-100/60">
      {/* Start Quiz Screen */}
      {currentScreen === "start" && (
        <div className="w-full h-full p-4 flex flex-col">
          <div className="flex-grow flex flex-col items-center justify-center text-center space-y-2 px-4">
            <h1 className="text-black text-xl font-extrabold sm:text-2xl md:text-4xl">
              {quizz.title}
            </h1>
            <div className="flex items-center justify-center gap-3 text-xs sm:text-sm mt-2 text-[#136A86]">
              <span>Quiz nº{quizz.id}</span>
              <span className="text-black">|</span>
              <span>{questions.length} Questions</span>
              <span className="text-black">|</span>
              <span>Time: {formatTime(quizz.duration_time || 300)}</span>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end mt-4 bottom-4 right-4 px-4">
            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="text-white text-sm sm:text-[16px] bg-[#136A86] py-2 sm:py-3 px-6 sm:px-10 font-bold rounded-lg hover:bg-[#0e556b] transition-colors cursor-pointer shadow-md disabled:opacity-50 w-full sm:w-auto"
            >
              {loading ? "Starting..." : "Start Quiz"}
            </button>
          </div>
        </div>
      )}

      {/* Question Screen */}
      {currentScreen === "question" && currentQuestion && (
        <div className="w-full p-4 sm:p-6 max-w-4xl mx-auto">
          {/* Prominent Timer at the top */}
          <div className="flex justify-center mb-4">
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                timeLeft < 60
                  ? "bg-red-100 border border-red-300"
                  : "bg-[#eaf5f7] border border-[#5CB5BD]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${
                  timeLeft < 60 ? "text-red-500" : "text-[#136A86]"
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
                className={`text-base font-bold ${
                  timeLeft < 60 ? "text-red-500" : "text-[#136A86]"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 w-full">
              <p className="text-[#136A86] text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-0">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="bg-gray-200 h-2 w-full sm:w-1/2 rounded-full overflow-hidden">
              <div
                className="bg-[#136A86] h-full rounded-full"
                style={{
                  width: `${((currentQuestionIndex+1 )/ questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4 sm:mb-6">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
              {currentQuestion.text}
            </h1>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors group ${
                  selectedOption === option.id
                    ? "border-[#5CB5BD]"
                    : "border-balck"
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
          <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || loading}
              className={`bg-[#136A86] text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg ${
                selectedOption === null || loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#0e556b] cursor-pointer"
              } transition-colors shadow-md active:scale-95 transform w-full sm:w-auto`}
            >
              {loading ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Completed Screen */}
      {currentScreen === "completed" && (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-center items-center">
          {/* Timer finished indicator */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-base font-medium text-gray-600">
                Quiz Completed
              </span>
            </div>
          </div>

          <div className="text-left space-y-6 w-full max-w-full h-full">
            {/* Star Rating at the top - Dynamic based on score */}
            <div className="flex justify-center sm:justify-start space-x-2">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    index < calculateStars()
                      ? "text-amber-500 fill-current"
                      : "text-gray-400/90 fill-current"
                  }`}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>

            {/* Feedback message */}
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#136A86]">
                {calculatePercentage() >= 90
                  ? "Excellent job!"
                  : calculatePercentage() >= 70
                  ? "Great job!"
                  : calculatePercentage() >= 50
                  ? "Good job!"
                  : "Keep practicing!"}
              </h2>
              <p className="text-gray-700 mt-1 text-sm sm:text-base max-w-md">
                {calculateStars() >= 3
                  ? "You are ready to move on to the next lecture."
                  : "Try again to unlock the next lecture."}
                <span className="block mt-1 text-xs text-gray-500">
                  {calculatePercentage()}% correct answers
                </span>
              </p>
            </div>

            {/* Score and Time section */}
            <div className="flex flex-col 2xl:flex-row items-center justify-center sm:justify-between gap-8">
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
                      stroke="#5CB5BD"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 45 * (1 - (questions.length > 0 ? score / questions.length : 0))
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
                      <span className="text-balck font-semibold text-sm">
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

              {/* Continue button */}
            {
              !quizz.isQuizPassed && <div className="mt-6 flex justify-center sm:justify-end">
              <button
                className="bg-[#136A86] text-white font-bold py-3 px-6 sm:py-3 sm:px-16 cursor-pointer rounded-lg hover:bg-[#0e556b] transition-colors shadow-sm w-full max-w-xs"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
            }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}