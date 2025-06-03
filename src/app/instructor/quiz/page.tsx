// src/app/admin/quizzes/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuizzes } from "@/lib/hooks/useQuizzes";
import { DataTable, ActionButton } from "@/components/common/DataTable";
import { MRT_ColumnDef } from "material-react-table";
import AdminSpinner from "@/components/common/AdminSpinnter";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import QuizModal from "@/components/ui/QuizModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { PencilLine, Trash2 } from "lucide-react";

export interface Quiz {
  id: number;
  title: string;
  duration: number; // in minutes
  questionsCount: number;
  isFinal?: boolean;
}

interface QuizQuestion {
  text: string;
  options: {
    text: string;
    is_correct: boolean;
  }[];
}

interface QuizWithQuestions extends Omit<Quiz, "id" | "questionsCount"> {
  questions: {
    text: string;
    options: {
      text: string;
      is_correct: boolean;
    }[];
  }[];
  isFinal?: boolean;
}

export default function QuizzesManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<(Quiz & { questions?: QuizQuestion[] }) | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);

  const {
    quizzes,
    loading,
    isMutating,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizWithQuestions,
  } = useQuizzes();

  // Transform server data format to table format
  const tableQuizzes: Quiz[] = quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    duration: quiz.duration_time,
    questionsCount: quiz.question_count,
    isFinal: quiz.isFinal || false,
  }));


  const handleAddQuiz = async (quiz: QuizWithQuestions) => {
    setModalLoading(true);
    try {
      await createQuiz({
        title: quiz.title,
        duration_time: quiz.duration * 60,
        isFinal: quiz.isFinal,
        questions: quiz.questions,
      });
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to create quiz:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditQuiz = async (
    id: number,
    updatedQuiz: QuizWithQuestions
  ) => {
    setModalLoading(true);
    try {
      await updateQuiz(id, {
        title: updatedQuiz.title,
        duration_time: updatedQuiz.duration * 60,
        isFinal: updatedQuiz.isFinal,
        questions: updatedQuiz.questions,
      });
      setModalOpen(false);
      setSelectedQuiz(null);
    } catch (error) {
      console.error("Failed to update quiz:", error);
    } finally {
      setModalLoading(false);
    }
  };

  // This function prepares quiz data for editing
  const handleEditClick = async (quiz: Quiz) => {
    setModalLoading(true);
    try {
      const fullQuizData = await getQuizWithQuestions(quiz.id);
      setSelectedQuiz({
        ...quiz,
        duration: quiz.duration / 60,
        questions: fullQuizData.data.questions
      });
      setModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch quiz details:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      setQuizToDelete(id);
      setDeleteModalOpen(true);
    }, 300);
  };

  const confirmDelete = async () => {
    if (quizToDelete) {
      setDeleteLoading(true);
      try {
        await deleteQuiz(quizToDelete);
      } catch (error) {
        console.error("Failed to delete quiz:", error);
      } finally {
        setDeleteLoading(false);
        setDeleteModalOpen(false);
        setQuizToDelete(null);
      }
    }
  };

  const handleAddClick = async () => {
    setModalLoading(true);
    setTimeout(() => {
      setSelectedQuiz(null); // Clear any selected quiz
      setModalLoading(false);
      setModalOpen(true);
    }, 300);
  };

  const handleSubmit = async (quiz: QuizWithQuestions) => {
    if (selectedQuiz) {
      await handleEditQuiz(selectedQuiz.id, quiz);
    } else {
      await handleAddQuiz(quiz);
    }
  };

  const formatTime = (seconds: number) => {
    seconds = seconds / 60;
    if (seconds < 60) {
      return `${seconds} min`;
    } else {
      const hours = Math.floor(seconds / 60);
      const remainingMinutes = seconds % 60;
      if (remainingMinutes === 0) {
        return `${hours} hr`;
      } else {
        return `${hours} hr ${remainingMinutes} min`;
      }
    }
  };

  const columns = useMemo<MRT_ColumnDef<Quiz>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Quiz Title",
        size: 250,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        size: 120,
        Cell: ({ cell }) => formatTime(cell.getValue<number>()),
      },
      {
        accessorKey: "questionsCount",
        header: "Number of Questions",
        size: 150,
      },
      {
        accessorKey: "isFinal",
        header: "Is Final",
        size: 80,
        Cell: ({ cell }) => {
          const isFinal = cell.getValue<boolean>();
          return (
            <span
              className={`px-2 py-1 text-sm font-medium rounded-full ${
                isFinal
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isFinal ? "Yes" : "No"}
            </span>
          );
        },
      },
    ],
    []
  );

  const actionButtons: ActionButton<Quiz>[] = [
    {
      icon: (
          <PencilLine
            size={32}
            strokeWidth={3}
            className="text-[#8C8FA5] hover:text-white hover:bg-[#8C8FA5] transition-colors duration-200 cursor-pointer border-2 p-1 rounded-full border-[#8C8FA5]"
          />
      ),
      onClick: (row) => handleEditClick(row),
      tooltip: "Edit quiz",
    },
    {
      icon: (
          <Trash2
            size={32}
            strokeWidth={3}
            className="text-[#FF0000] hover:text-white hover:bg-[#FF0000] border-2 p-1 rounded-full border-[#FF0000] transition-colors duration-200 cursor-pointer"
          />
      ),
      onClick: (row) => handleDeleteClick(row.id),
      tooltip: "Delete quiz",
    },
  ];

  if (loading) {
    return <AdminSpinner />;
  }

  return (
    <div className="min-h-screen sm:p-6">
      <div className="mx-auto">
        <AdminPageHeader
          title="QUIZZES"
          showAddButton={true}
          addButtonText="Add Quiz"
          onAddClick={handleAddClick}
          searchPlaceholder="Search quiz"
        />

        {modalLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/10 bg-opacity-50 backdrop-blur-md z-50">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-12 space-y-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-lg font-medium text-gray-500">
              No quizzes found
            </p>
            <p className="text-sm text-gray-400">
              Try creating a new one or adjusting your search.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tableQuizzes}
            isLoading={loading}
            isPending={isMutating}
            actionButtons={actionButtons}
          />
        )}


        <QuizModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedQuiz(null);
          }}
          onSubmit={handleSubmit}
          initialData={selectedQuiz}
          isLoading={modalLoading}
        />

        {deleteLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/10 bg-opacity-50 backdrop-blur-md z-50">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemName="quiz"
          isLoading={deleteLoading}
        />
      </div>
    </div>
  );
}
