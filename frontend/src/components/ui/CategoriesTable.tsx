// src/components/ui/CategoriesTable.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_SortingState,
} from "material-react-table";
import { Box, IconButton } from "@mui/material";
import { Trash2, PencilLine } from "lucide-react";
import CategoryModal from "./CategoryModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  courseCount: number;
}

interface CategoriesTableProps {
  categories: Category[];
  isLoading?: boolean;
  onAddCategory?: (category: Omit<Category, "id">) => void;
  onEditCategory?: (id: string, category: Omit<Category, "id">) => void;
  onDeleteCategory?: (id: string) => Promise<void>; // Changed to return Promise
  modalOpenState?: boolean;
  setModalOpen?: (open: boolean) => void;
  onSortChange?: (
    sortBy: "name" | "courseCount",
    sortOrder: "asc" | "desc"
  ) => void;
}

export default function CategoriesTable({
  categories = [],
  isLoading = false,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  modalOpenState,
  setModalOpen,
  onSortChange,
}: CategoriesTableProps) {
  const [modalOpen, setModalOpenInternal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const isModalOpen = modalOpenState !== undefined ? modalOpenState : modalOpen;
  const setIsModalOpen = setModalOpen || setModalOpenInternal;

  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const handleSubmit = async (category: Omit<Category, "id">) => {
    setModalLoading(true);

    try {
      if (currentCategory) {
        await onEditCategory?.(currentCategory.id, category);
      } else {
        await onAddCategory?.(category);
      }
      setIsModalOpen(false);
      setCurrentCategory(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      setCategoryToDelete(id);
      setDeleteModalOpen(true);
    }, 300); // simulate loading spinner
  }, []);

  const confirmDelete = async () => {
    if (categoryToDelete && onDeleteCategory) {
      setDeleteLoading(true);
      try {
        await onDeleteCategory(categoryToDelete);
      } finally {
        setDeleteLoading(false);
        setDeleteModalOpen(false);
      }
    }
  };

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Category Name",
        size: 200,
        enableSorting: true,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "courseCount",
        header: "Including courses",
        size: 100,
        enableSorting: true,
        sortingFn: "basic",
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
                  setModalLoading(true);
                  setCurrentCategory(row.original);
                  setTimeout(() => {
                    setModalLoading(false);
                    setIsModalOpen(true);
                  }, 300);
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
                onClick={() => handleDeleteClick(row.original.id)}
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
    [handleDeleteClick, setIsModalOpen]
  );

  return (
    <>
      <div className="overflow-x-auto shadow-lg">
        <MaterialReactTable
          columns={columns}
          data={categories}
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
              const sortBy = sort.id as "name" | "courseCount";
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

      <CategoryModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentCategory(null);
        }}
        onSubmit={handleSubmit}
        initialData={currentCategory}
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
        itemName="category"
        isLoading={deleteLoading}
      />
    </>
  );
}
