// src/app/admin/categories/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useCategories } from "@/lib/hooks/useCategories";
import { DataTable, ActionButton } from "@/components/common/DataTable";
import { MRT_ColumnDef } from "material-react-table";
import Spinner from "@/components/common/spinner";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { PencilLine, Trash2 } from "lucide-react";
import CategoryModal from "@/components/ui/CategoryModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  creatorName?: string;
  courseCount: number;
  createdBy?: number;
}

export default function CategoriesManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const {
    categories,
    loading,
    isMutating,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const { user } = useAuthStore();
  const isAdmin = user && "role" in user ? user.role === "admin" : false;

  const tableData: Category[] = (categories || []).map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    slug: cat.slug,
    courseCount: cat.courseCount || 0,
    createdBy: cat.createdBy,
    creatorName: cat.creatorName || "",
  }));

  const handleAddCategory = async (category: Omit<Category, "id">) => {
    setModalLoading(true);
    try {
      await createCategory({ name: category.name });
      setModalOpen(false);
      setCurrentCategory(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditCategory = async (
    id: string,
    updatedCategory: Omit<Category, "id">
  ) => {
    setModalLoading(true);
    try {
      const categoryToUpdate = tableData.find((cat) => cat.id === id);
      if (categoryToUpdate?.slug) {
        await updateCategory(categoryToUpdate.slug, {
          name: updatedCategory.name,
        });
        setModalOpen(false);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      setCategoryToDelete(id);
      setDeleteModalOpen(true);
    }, 300);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      setDeleteLoading(true);
      try {
        const category = tableData.find((cat) => cat.id === categoryToDelete);
        if (category?.slug) {
          await deleteCategory(category.slug);
        }
      } finally {
        setDeleteLoading(false);
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      }
    }
  };

  const handleAddClick = () => {
    setModalLoading(true);
    setCurrentCategory(null);
    setTimeout(() => {
      setModalLoading(false);
      setModalOpen(true);
    }, 300);
  };

  const handleEditClick = (category: Category) => {
    setModalLoading(true);
    setCurrentCategory(category);
    setTimeout(() => {
      setModalLoading(false);
      setModalOpen(true);
    }, 300);
  };

  const handleSubmit = async (category: Omit<Category, "id">) => {
    if (currentCategory) {
      await handleEditCategory(currentCategory.id, category);
    } else {
      await handleAddCategory(category);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Category Name",
        size: 200,
      },
      {
        accessorKey: "creatorName",
        header: "Created by",
        size: 200,
      },
      {
        accessorKey: "courseCount",
        header: "Including courses",
        size: 100,
      },
    ],
    []
  );

  const actionButtons: ActionButton<Category>[] = [
    {
      icon: (
        <PencilLine
          size={32}
          strokeWidth={3}
          className="text-[#8C8FA5] hover:text-white hover:bg-[#8C8FA5] transition-colors duration-200 cursor-pointer border-2 p-1 rounded-full border-[#8C8FA5]"
        />
      ),
      onClick: (row: Category) => {
        if (isAdmin || row.createdBy === (user?.id as number)) {
          handleEditClick(row);
        } else {
          toast.warning("You don't have permission to edit this category.");
        }
      },
      tooltip: "Edit category",
    },
    {
      icon: (
        <Trash2
          size={32}
          strokeWidth={3}
          className="text-[#FF0000] hover:text-white hover:bg-[#FF0000] border-2 p-1 rounded-full border-[#FF0000] transition-colors duration-200 cursor-pointer"
        />
      ),
      onClick: (row: Category) => {
        if (isAdmin || row.createdBy === (user?.id as number)) {
          handleDeleteClick(row.id);
        } else {
          toast.warning("You don't have permission to delete this category.");
        }
      },
      tooltip: "Delete category",
    },
  ];

  if (loading && !categories.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen sm:p-6">
      <div className="mx-auto">
        <AdminPageHeader
          title="CATEGORIES"
          showAddButton={true}
          addButtonText="Add Category"
          onAddClick={handleAddClick}
          searchPlaceholder="Search category"
        />

        {modalLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white/10 bg-opacity-50 backdrop-blur-md z-50">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && tableData.length === 0 ? (
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
              No categories found
            </p>
            <p className="text-sm text-gray-400">
              Try creating a new one or adjusting your search.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tableData}
            isLoading={loading}
            isPending={isMutating}
            actionButtons={actionButtons}
            enablePagination={true}
            enableSearch={true}
          />
        )}

        <CategoryModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
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
      </div>
    </div>
  );
}
