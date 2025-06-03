// src/components/ui/QuizzesTable.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_SortingState,
} from "material-react-table";
import { Box, IconButton } from "@mui/material";
import { Trash2, PencilLine } from "lucide-react";
import QuizModal from "./QuizModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { getQuizById } from "@/lib/api/quizzes";

export interface Quiz {
  id: number;
  title: string;
  duration: number; // in minutes
  questionsCount: number;
  isFinal?: boolean;
}

interface QuizWithQuestions extends Omit<Quiz, "id" | "questionsCount"> {
  questions: {
    text: string;
    options: {
      text: string;
      is_correct: boolean;
    }[];
  }[];
}

interface Question {
  text: string;
  options: {
    text: string;
    is_correct: boolean;
  }[];
}

interface QuizzesTableProps {
  quizzes: Quiz[];
  isLoading?: boolean;
  onAddQuiz?: (quiz: QuizWithQuestions) => void;
  onEditQuiz?: (id: number, quiz: QuizWithQuestions) => void;
  onDeleteQuiz?: (id: number) => Promise<void>;
  modalOpenState?: boolean;
  setModalOpen?: (open: boolean) => void;
  onSortChange?: (
    sortBy: "title" | "duration" | "questionsCount",
    sortOrder: "asc" | "desc"
  ) => void;
  onEditClick?: (quiz: Quiz) => Promise<void>;
  currentQuiz?: (Quiz & { questions?: Question[]; isFinal?: boolean }) | null;
}

export default function QuizzesTable({
  quizzes = [],
  isLoading = false,
  onAddQuiz,
  onEditQuiz,
  onDeleteQuiz,
  modalOpenState,
  setModalOpen,
  onSortChange,
  onEditClick,
  currentQuiz,
}: QuizzesTableProps) {
  const [modalOpen, setModalOpenInternal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [currentQuizState, setCurrentQuizState] = useState<
    (Quiz & { questions?: Question[]; isFinal?: boolean }) | null
  >(null);

  const isModalOpen = modalOpenState !== undefined ? modalOpenState : modalOpen;
  const setIsModalOpen = setModalOpen || setModalOpenInternal;

  // Use either props.currentQuiz or local state
  const activeQuiz = currentQuiz || currentQuizState;

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const handleSubmit = async (quiz: QuizWithQuestions) => {
    setModalLoading(true);

    try {
      if (activeQuiz) {
        await onEditQuiz?.(activeQuiz.id, {
          ...quiz,
          duration: quiz.duration,
          questions: quiz.questions,
        });
      } else {
        await onAddQuiz?.({
          ...quiz,
          duration: quiz.duration,
          questions: quiz.questions,
        });
      }
      setIsModalOpen(false);
      setCurrentQuizState(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditClick = useCallback(
    async (quiz: Quiz) => {
      try {
        const quizWithQuestions = await getQuizById(quiz.id);
        setCurrentQuizState({
          ...quiz,
          questions: quizWithQuestions.data.questions,
          isFinal: quizWithQuestions.data.isFinal,
        });
        setIsModalOpen(true);
      } catch (error) {
        console.error("Failed to fetch quiz details:", error);
      }
    },
    [getQuizById]
  );

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      setQuizToDelete(String(id));
      setDeleteModalOpen(true);
    }, 300);
  }, []);

  const confirmDelete = async () => {
    if (quizToDelete && onDeleteQuiz) {
      setDeleteLoading(true);
      try {
        await onDeleteQuiz(Number(quizToDelete));
      } finally {
        setDeleteLoading(false);
        setDeleteModalOpen(false);
      }
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
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
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "duration",
        header: "Duration",
        size: 120,
        enableSorting: true,
        sortingFn: "basic",
        Cell: ({ row }) => formatTime(row.original.duration),
      },
      {
        accessorKey: "questionsCount",
        header: "Number of Questions",
        size: 150,
        enableSorting: true,
        sortingFn: "basic",
      },
      {
        accessorKey: "isFinal",
        header: "Is Final",
        size: 50,
        enableSorting: true,
        sortingFn: "alphanumeric",
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
      {
        id: "actions",
        header: "",
        size: 100,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1, justifyContent: "end" }}>
            <span className="p-1 border-2 border-[#8C8FA5] bg-white rounded-full hover:bg-[#136A86] transition-colors duration-200 hover:border-[#136A86]">
              <IconButton
                onClick={() => {
                  if (onEditClick) {
                    onEditClick(row.original);
                  } else {
                    handleEditClick(row.original);
                  }
                }}
                className="!p-0"
              >
                <PencilLine
                  size={21}
                  strokeWidth={3}
                  className="text-[#8C8FA5] hover:text-white transition-colors duration-200"
                />
              </IconButton>
            </span>
            <span className="p-1 border-2 border-[#FF0000] bg-white rounded-full hover:bg-[#FF0000] transition-colors duration-200">
              <IconButton
                onClick={() => handleDeleteClick(Number(row.original.id))}
                className="!p-0"
              >
                <Trash2
                  size={22}
                  strokeWidth={3}
                  className="text-[#FF0000] hover:text-white transition-colors duration-200"
                />
              </IconButton>
            </span>
          </Box>
        ),
      },
    ],
    [handleDeleteClick, onEditClick, handleEditClick]
  );

  return (
    <>
      <div className="overflow-x-auto shadow-lg">
        <MaterialReactTable
          columns={columns}
          data={quizzes}
          enableColumnResizing={false}
          enableColumnFilters={true}
          enableDensityToggle={false}
          enableFullScreenToggle={true}
          enableHiding={true}
          enableColumnActions={false}
          enableTableHead={true}
          enableTopToolbar={true}
          enableBottomToolbar={false}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e0e0e0",
              boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
              paddingLeft: {
                xs: "10px",
                md: "5rem",
              },
              paddingRight: {
                xs: "10px",
                md: "3rem",
              },
              paddingBottom: {
                xs: "0.5rem",
                md: "1.5rem",
              },
            },
          }}
          muiTableBodyRowProps={{
            hover: false,
            sx: {
              "&:nth-of-type(odd)": {
                backgroundColor: "#ffffff",
              },
              "&:nth-of-type(even)": {
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              },
            },
          }}
          muiTableBodyCellProps={({ row, table }) => ({
            sx: {
              paddingLeft: 0,
              paddingRight: 0,
              textAlign: "left",
              borderBottom:
                row.index === table.getRowModel().rows.length - 1
                  ? "none"
                  : "0.5px solid #136A86",
            },
          })}
          muiTableHeadCellProps={{
            sx: {
              fontSize: "16px",
              fontWeight: 700,
              color: "#136A86",
              backgroundColor: "#FFFFFF",
              paddingBottom: "1.5rem",
              borderBottom: "none",
              paddingLeft: 0,
              textAlign: "left",
            },
          }}
          state={{ isLoading, sorting }}
          onSortingChange={(updaterOrValue) => {
            const newSorting =
              typeof updaterOrValue === "function"
                ? updaterOrValue(sorting)
                : updaterOrValue;

            setSorting(newSorting);

            if (newSorting.length > 0) {
              const sort = newSorting[0];
              const sortBy = sort.id as "title" | "duration" | "questionsCount";
              const sortOrder = sort.desc ? "desc" : "asc";
              onSortChange?.(sortBy, sortOrder);
            }
          }}
        />
      </div>

      {modalLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/10 bg-opacity-50 backdrop-blur-md z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <QuizModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSubmit={handleSubmit}
        initialData={activeQuiz}
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
    </>
  );
}
