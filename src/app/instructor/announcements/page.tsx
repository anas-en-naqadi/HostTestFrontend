"use client";

import { useEffect, useState } from "react";
import { ActionButton, DataTable } from "@/components/common/DataTable";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { useAnnouncements } from "@/lib/hooks/useAnnouncements";
import { useCourseOptions } from "@/lib/hooks/useCourseOptions"; // Import our new hook
import { Announcement } from "@/types/announcement.types";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { MRT_ColumnDef } from "material-react-table";
import { formatDate } from "@/utils/formatDate";
import Image from "next/image";
import AnnouncementModal from "@/components/ui/AnnouncementModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import DOMPurify from "dompurify";
import ReactQuill from "react-quill-new";
import { useAuthStore } from "@/store/authStore";

const AnnouncementsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<Announcement | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<
    number | null
  >(null);

  const { user } = useAuthStore(); // Assuming you have an auth context
  const isAdmin = user?.role === 'admin';
  const currentUserId = user?.id;

    const {
      announcements,
      isLoading,
      isPending,
      fetchAnnouncements,
      deleteAnnouncement,
      createAnnouncement,
      updateAnnouncement,
    } = useAnnouncements();
  
    useEffect(() => {
      fetchAnnouncements();
    }, []);

  // Use our new hook to fetch course options
  const {
    courseOptions,
    fetchCourseOptions,
    isLoading: coursesLoading,
  } = useCourseOptions(currentUserId, isAdmin);


  // Fetch course options when the component mounts or modal opens
  useEffect(() => {
    if (modalOpen) {
      fetchCourseOptions();
    }
  }, [modalOpen]);


  const handleDelete = (announcement: Announcement) => {
    setDeleteLoading(true);
    setTimeout(() => {
      setDeleteLoading(false);
      setAnnouncementToDelete(announcement.id);
      setDeleteModalOpen(true);
    }, 300); // Simulate loading spinner like in the example
  };

  const confirmDelete = async () => {
    if (announcementToDelete !== null) {
      setDeleteLoading(true);
      try {
        await deleteAnnouncement(announcementToDelete);
        fetchAnnouncements();
      } finally {
        setDeleteLoading(false);
        setDeleteModalOpen(false);
      }
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setModalLoading(true);
    setCurrentAnnouncement(announcement);
    // Fetch course options before opening the modal
    fetchCourseOptions().finally(() => {
      setModalLoading(false);
      setModalOpen(true);
    });
  };

  const handleAddClick = () => {
    setCurrentAnnouncement(null);
    // Fetch course options before opening the modal
    setModalLoading(true);
    fetchCourseOptions().finally(() => {
      setModalLoading(false);
      setModalOpen(true);
    });
  };

  const handleSubmitAnnouncement = async (
    announcementData: Partial<Announcement>
  ) => {
    setModalLoading(true);
    try {
      if (currentAnnouncement) {
        // Update existing announcement
        await updateAnnouncement(currentAnnouncement.id, announcementData);
      } else {
        // Create new announcement
        await createAnnouncement(announcementData);
      }
      // Refresh the data
      fetchAnnouncements();
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving announcement:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const columns: MRT_ColumnDef<Announcement>[] = [
    {
      accessorKey: "courses.thumbnail_url",
      header: "",
      size: 100,
      enableSorting: false,
      Header: () => (
        <div className="flex items-center justify-center">
          <button
            onClick={handleAddClick}
            className="p-1.5 rounded-full border border-[#8C8FA5] hover:bg-[#136A86] text-[#8C8FA5] hover:text-white cursor-pointer flex items-center justify-center"
          >
            <Plus size={22} />
          </button>
        </div>
      ),
      Cell: ({ row }) => {
        return (
          <div className="w-full h-full flex items-center">
      <Image
        src={row.original.courses?.thumbnail_url || "/placeholder-course.webp"}
        alt={row.original.courses?.title}
        width={62}
        height={35}
        className="object-cover rounded-[6px] max-w-[62px] max-h-[35px]"
      />
    </div>
        );
      },
    },
    {
      accessorKey: "courses.title",
      header: "Course Title",
      size: 200,
    },
    {
      accessorKey: "courses.user.full_name",
      header: "Instructor",
      size: 150,
      Cell: ({ row }) => {
        return row.original.courses?.user?.full_name || "N/A";
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      size: 200,
    },
    {
      accessorKey: "content",
      header: "Content",
      size: 300,
      Cell: ({ row }) => {
        const cleanHtml = DOMPurify.sanitize(row.original.content || "");
        return (
          <div className="overflow-y-scroll h-24">
            <ReactQuill
            value={cleanHtml}
            readOnly={true}
            theme="snow"
            modules={{ toolbar: false }}
            className="my-quill"
          />
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created at",
      size: 150,
      Cell: ({ row }) => {
        return formatDate(row.original.created_at);
      },
    },
  ];

  const actionButtons: ActionButton<Announcement>[] = [
    {
      icon: (
        <PencilLine
          size={32}
          strokeWidth={3}
          className="text-[#8C8FA5] hover:text-white hover:bg-[#8C8FA5] transition-colors duration-200 cursor-pointer border-2 p-1 rounded-full border-[#8C8FA5]"
        />
      ),
      onClick: handleEdit,
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
      onClick: handleDelete,
      tooltip: "Delete category",
    },
  ];

  return (
    <div className="container mx-auto p-3 sm:p-6">
      <AdminPageHeader
        title="Announcements"
        showAddButton={true}
        addButtonText="Add Announcement"
        onAddClick={handleAddClick}
        searchPlaceholder="Search announcement"
      />

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={announcements}
          isLoading={isLoading}
          isPending={isPending}
          actionButtons={actionButtons}
        />

        
      </div>

      {/* Loading Spinner */}
      {(modalLoading || coursesLoading) && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/10 bg-opacity-50 backdrop-blur-md z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Announcement Modal */}
      <AnnouncementModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCurrentAnnouncement(null);
        }}
        onSubmit={handleSubmitAnnouncement}
        initialData={currentAnnouncement}
        isLoading={modalLoading}
        courses={courseOptions}
      />

      {/* Delete Loading Spinner */}
      {deleteLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/10 bg-opacity-50 backdrop-blur-md z-50">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName="announcement"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default AnnouncementsPage;