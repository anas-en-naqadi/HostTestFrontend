"use client";

import { useEffect, useState } from "react";
import { Quiz } from "./QuizzesTable";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Option {
  id?: number; // Using number type to match backend
  text: string;
  is_correct: boolean;
}

interface Question {
  id?: number; // Using number type to match backend
  text: string;
  options: Option[];
}

interface QuizModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    quiz: Omit<Quiz, "id" | "questionsCount"> & {
      questions: Question[];
      isFinal: boolean;
    }
  ) => void;
  initialData:
    | (Quiz & {
        questions?: Question[];
        isFinal?: boolean;
      })
    | null;
  isLoading?: boolean;
}

export default function QuizModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: QuizModalProps) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [isFinal, setIsFinal] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Separate state for new question form and edit question form
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [showEditQuestionForm, setShowEditQuestionForm] = useState(false);

  const [newQuestion, setNewQuestion] = useState<Question | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDuration(initialData.duration);
      setIsFinal(initialData.isFinal || false);

      if (initialData.questions) {
        // Ensure we correctly handle existing questions with their IDs
        const formattedQuestions = initialData.questions.map((q) => ({
          id: typeof q.id === "string" ? parseInt(q.id) : q.id, // Convert string IDs to numbers if needed
          text: q.text,
          options: q.options.map((o) => ({
            id: typeof o.id === "string" ? parseInt(o.id) : o.id, // Convert string IDs to numbers if needed
            text: o.text,
            is_correct: o.is_correct,
          })),
        }));
        setQuestions(formattedQuestions);
      }
    } else {
      // Reset form for new quiz
      setTitle("");
      setDuration(30);
      setIsFinal(false);
      setQuestions([]);
    }
    setShowNewQuestionForm(false);
    setShowEditQuestionForm(false);
    setNewQuestion(null);
    setEditingQuestion(null);
    setEditingQuestionIndex(null);
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length < 6) {
      toast.error("Minimum 6 questions required to create a quiz");
      return;
    }
    console.log("Submitting with isFinal:", isFinal);
    // Ensure all questions and options have proper ID handling before submission
    const processedQuestions = questions.map((question) => {
      // For existing questions, maintain the ID
      // For new questions, leave ID undefined so backend knows to create new
      return {
        ...question,
        // If string ID, convert to number
        id:
          question.id !== undefined
            ? typeof question.id === "string"
              ? parseInt(question.id)
              : question.id
            : undefined,
        options: question.options.map((option) => ({
          ...option,
          // If string ID, convert to number
          id:
            option.id !== undefined
              ? typeof option.id === "string"
                ? parseInt(option.id)
                : option.id
              : undefined,
        })),
      };
    });

    onSubmit({
      title,
      duration,
      isFinal,
      questions: processedQuestions,
    });
  };

  const startAddQuestion = () => {
    setNewQuestion({
      text: "",
      options: [{ text: "", is_correct: false }],
    });
    setShowNewQuestionForm(true);
  };

  const startEditQuestion = (index: number) => {
    setEditingQuestion({ ...questions[index] });
    setEditingQuestionIndex(index);
    setShowEditQuestionForm(true);
  };

  const saveNewQuestion = () => {
    if (!newQuestion) return;

    // Add new question - ensure it has no ID to signal it's new
    const questionToAdd = {
      ...newQuestion,
      id: undefined, // Explicitly unset ID for new questions
    };
    setQuestions([...questions, questionToAdd]);

    setShowNewQuestionForm(false);
    setNewQuestion({
      text: "",
      options: [{ text: "", is_correct: false }],
    });
  };

  const saveEditedQuestion = () => {
    if (!editingQuestion || editingQuestionIndex === null) return;

    // Update existing question
    const updatedQuestions = [...questions];
    updatedQuestions[editingQuestionIndex] = editingQuestion;
    setQuestions(updatedQuestions);

    setShowEditQuestionForm(false);
    setEditingQuestion(null);
    setEditingQuestionIndex(null);
  };

  const addNewOption = () => {
    if (!newQuestion) return;
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, { text: "", is_correct: false }],
    });
  };

  const removeNewOption = (index: number) => {
    if (!newQuestion) return;
    const newOptions = [...newQuestion.options];
    newOptions.splice(index, 1);
    setNewQuestion({
      ...newQuestion,
      options: newOptions,
    });
  };

  const updateNewOptionText = (index: number, text: string) => {
    if (!newQuestion) return;
    const newOptions = [...newQuestion.options];
    newOptions[index].text = text;
    setNewQuestion({
      ...newQuestion,
      options: newOptions,
    });
  };

  const updateNewOptionCorrect = (index: number) => {
    if (!newQuestion) return;
    const newOptions = newQuestion.options.map((option, i) => ({
      ...option,
      is_correct: i === index,
    }));
    setNewQuestion({
      ...newQuestion,
      options: newOptions,
    });
  };

  const addEditOption = () => {
    if (!editingQuestion) return;
    setEditingQuestion({
      ...editingQuestion,
      options: [...editingQuestion.options, { text: "", is_correct: false }],
    });
  };

  const removeEditOption = (index: number) => {
    if (!editingQuestion) return;
    const editOptions = [...editingQuestion.options];
    editOptions.splice(index, 1);
    setEditingQuestion({
      ...editingQuestion,
      options: editOptions,
    });
  };

  const updateEditOptionText = (index: number, text: string) => {
    if (!editingQuestion) return;
    const editOptions = [...editingQuestion.options];
    editOptions[index].text = text;
    setEditingQuestion({
      ...editingQuestion,
      options: editOptions,
    });
  };

  const updateEditOptionCorrect = (index: number) => {
    if (!editingQuestion) return;
    const editOptions = editingQuestion.options.map((option, i) => ({
      ...option,
      is_correct: i === index,
    }));
    setEditingQuestion({
      ...editingQuestion,
      options: editOptions,
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[939px] h-full max-h-[90vh] mx-4 p-4 md:p-10 overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#136A86] mb-6">
          {initialData ? "Edit Quiz" : "Add New Quiz"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm sm:text-base font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="w-full sm:h-12 px-3 py-2 border border-black rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#136A86]"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm sm:text-base font-medium mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              className="w-full sm:h-12 px-3 py-2 border border-black rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#136A86]"
              required
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="isFinal"
              checked={isFinal}
              onChange={(e) => setIsFinal(e.target.checked)}
              className="h-4 w-4 text-[#136A86] focus:ring-[#136A86] rounded cursor-pointer"
            />
            <label
              htmlFor="isFinal"
              className="ml-2 text-sm sm:text-base font-medium cursor-pointer"
            >
              Final Quiz
            </label>
          </div>

          <div className="mb-6">
            <h3 className="block text-sm sm:text-base font-medium mb-1">
              Questions
            </h3>

            {questions.length > 0 && (
              <div className="mb-4 border rounded-lg overflow-hidden">
                {/* Large screens: Standard table view */}
                <div className="hidden md:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Options
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {questions.map((question, qIndex) => (
                        <tr key={qIndex}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {question.text}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {
                              question.options.filter((o) => o.is_correct)
                                .length
                            }{" "}
                            correct / {question.options.length} total
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                            <button
                              type="button"
                              onClick={() => startEditQuestion(qIndex)}
                              className="text-[#136A86] hover:text-[#5CB5BD] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIndex)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Small/mobile screens: Card view */}
                <div className="block md:hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <div className="grid grid-cols-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questions ({questions.length})
                      </div>
                    </div>
                  </div>

                  {questions.map((question, qIndex) => (
                    <div key={qIndex} className="border-b p-4">
                      <div className="mb-2 text-sm font-medium text-gray-900">
                        {question.text}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {question.options.filter((o) => o.is_correct).length}{" "}
                        correct / {question.options.length} total
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => startEditQuestion(qIndex)}
                          className="text-[#136A86] hover:text-[#5CB5BD] cursor-pointer text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-600 hover:text-red-900 cursor-pointer text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Question Form */}
            {showNewQuestionForm && (
              <div className="p-4 rounded-lg mb-4 shadow-xl">
                <div className="relative flex flex-row mt-2">
                  <h1 className="text-[18px] font-bold md:text-[22px] text-[#136A86] mb-5">
                    Add New Question
                  </h1>
                  <button
                    type="button"
                    onClick={() => setShowNewQuestionForm(false)}
                    className="absolute px-3 py-1 text-sm text-[#136A86] hover:text-[#5CB5BD] cursor-pointer top-0 -right-2.5"
                  >
                    <X
                      size={36}
                      className="border-1 border-[#136A86] hover:border-[#5CB5BD] p-1 bg-white rounded-full"
                    />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={newQuestion?.text || ""}
                    onChange={(e) =>
                      newQuestion &&
                      setNewQuestion({
                        ...newQuestion,
                        text: e.target.value,
                      })
                    }
                    placeholder="Enter question text"
                    className="w-full sm:h-12 px-3 py-2 border border-black rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#136A86]"
                    required
                  />
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Options</h4>
                  <div className="flex flex-col gap-2 mb-2">
                    {newQuestion?.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full"
                      >
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) =>
                            updateNewOptionText(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 w-full sm:w-auto sm:h-12 px-3 py-2 border border-black rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#136A86]"
                          required
                        />
                        <div className="flex items-center gap-1 mt-2 sm:mt-0">
                          <input
                            type="radio"
                            name={`correctOption-new`}
                            checked={option.is_correct}
                            onChange={() => updateNewOptionCorrect(index)}
                            className="h-5 w-5 text-[#136A86] focus:ring-[#136A86] cursor-pointer"
                          />
                          <label
                            className="text-sm sm:text-base text-gray-700 cursor-pointer"
                            onClick={() => updateNewOptionCorrect(index)}
                          >
                            Correct
                          </label>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <button
                            type="button"
                            onClick={() => removeNewOption(index)}
                            className="text-red-500 hover:text-red-700 cursor-pointer border p-1 border-red-500 rounded-full"
                            disabled={newQuestion.options.length <= 1}
                          >
                            <X size="20" />
                          </button>

                          {/* Show the + button only next to the last option */}
                          {index === newQuestion.options.length - 1 && (
                            <button
                              type="button"
                              onClick={addNewOption}
                              className="p-1 border border-[#8C8FA5] text-[#8C8FA5] rounded-full hover:bg-gray-100 transition cursor-pointer"
                            >
                              <Plus size="20" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={saveNewQuestion}
                    disabled={
                      !newQuestion?.text ||
                      newQuestion.options.some((opt) => !opt.text) ||
                      !newQuestion.options.some((opt) => opt.is_correct)
                    }
                    className="px-3 w-full md:h-12 py-2 text-sm sm:text-base uppercase font-semibold text-white bg-[#136A86] rounded-[6px] hover:bg-[#5CB5BD] disabled:opacity-50 cursor-pointer"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            )}

            {/* Edit Question Form */}
            {showEditQuestionForm && (
              <div className="p-4 rounded-lg mb-4 shadow-xl">
                <div className="relative flex flex-row mt-2">
                  <h1 className="text-[18px] font-bold md:text-[22px] text-[#136A86] mb-5">
                    Edit Question
                  </h1>
                  <button
                    type="button"
                    onClick={() => setShowEditQuestionForm(false)}
                    className="absolute px-3 py-1 text-sm text-[#136A86] hover:text-[#5CB5BD] cursor-pointer top-0 -right-2.5"
                  >
                    <X
                      size={36}
                      className="border-1 border-[#136A86] hover:border-[#5CB5BD] p-1 bg-white rounded-full"
                    />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={editingQuestion?.text || ""}
                    onChange={(e) =>
                      editingQuestion &&
                      setEditingQuestion({
                        ...editingQuestion,
                        text: e.target.value,
                      })
                    }
                    placeholder="Enter question text"
                    className="w-full sm:h-12 px-3 py-2 border border-black rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#136A86]"
                    required
                  />
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Options</h4>
                  <div className="flex flex-col gap-2 mb-2">
                    {editingQuestion?.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full"
                      >
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) =>
                            updateEditOptionText(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 w-full sm:w-auto sm:h-12 px-3 py-2 border border-black rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#136A86]"
                          required
                        />
                        <div className="flex items-center gap-1 mt-2 sm:mt-0">
                          <input
                            type="radio"
                            name={`correctOption-edit`}
                            checked={option.is_correct}
                            onChange={() => updateEditOptionCorrect(index)}
                            className="h-5 w-5 text-[#136A86] focus:ring-[#136A86] cursor-pointer"
                          />
                          <label
                            className="text-sm sm:text-base text-gray-700 cursor-pointer"
                            onClick={() => updateEditOptionCorrect(index)}
                          >
                            Correct
                          </label>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <button
                            type="button"
                            onClick={() => removeEditOption(index)}
                            className="text-red-500 hover:text-red-700 cursor-pointer border p-1 border-red-500 rounded-full"
                            disabled={editingQuestion.options.length <= 1}
                          >
                            <X size="20" />
                          </button>

                          {/* Show the + button only next to the last option */}
                          {index === editingQuestion.options.length - 1 && (
                            <button
                              type="button"
                              onClick={addEditOption}
                              className="p-1 border border-[#8C8FA5] text-[#8C8FA5] rounded-full hover:bg-gray-100 transition cursor-pointer"
                            >
                              <Plus size="20" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={saveEditedQuestion}
                    disabled={
                      !editingQuestion?.text ||
                      editingQuestion.options.some((opt) => !opt.text) ||
                      !editingQuestion.options.some((opt) => opt.is_correct)
                    }
                    className="px-3 w-full md:h-12 py-2 text-sm sm:text-base uppercase font-semibold text-white bg-[#136A86] rounded-[6px] hover:bg-[#5CB5BD] disabled:opacity-50 cursor-pointer"
                  >
                    Update Question
                  </button>
                </div>
              </div>
            )}

            {/* Only show "Add new Question" button if neither form is open */}
            {!showNewQuestionForm && !showEditQuestionForm && (
              <button
                type="button"
                onClick={startAddQuestion}
                className="flex w-full text-base sm:text-xl items-center px-4 py-2 bg-[#F6F8FC] font-semibold rounded-[12px] border border-[#DCDCDC] cursor-pointer"
              >
                <span className="mr-3">
                  <Plus className="border-2 font-bold rounded-full p-0.5" />
                </span>{" "}
                Add new Question
              </button>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="sm:w-40 sm:h-12 px-4 py-2 text-sm md:text-base font-semibold text-[#136A86] hover:text-[#5CB5BD] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || questions.length === 0}
              className="sm:w-40 sm:h-12 px-4 py-2 text-sm md:text-base font-semibold text-white bg-[#136A86] rounded-md hover:bg-[#5CB5BD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#136A86] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : initialData ? (
                "Update Quiz"
              ) : (
                "Add Quiz"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
