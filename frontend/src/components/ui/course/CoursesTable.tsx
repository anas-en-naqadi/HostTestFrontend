"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { MoreVertical, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { useFetchUserCourses, useRemoveCourse, useChangeCourseStatus } from "@/lib/hooks/course-management";
import { alertConfirm, alertSuccess } from "@/utils/alert";
import { CourseResponse } from "@/types/course.types";
import { MRT_ColumnDef } from "material-react-table";
import DataTable from "../../common/DataTable";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { toast } from "sonner";
import AdminSpinner from "../../common/AdminSpinnter";
import Image from "next/image";
import { useSearchContext } from "@/contexts/SearchContext";
import { CustomSwitch } from "../CustomSwitch";
import DeleteConfirmationModal from "../DeleteConfirmationModal";
import Link from "next/link";
import { formatDuration } from "@/utils/formatDuration";
import { navigate } from "@/lib/utils/navigator";

// Define interface for the API response structure based on the actual response
interface ApiCourseResponse {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string;
  difficulty: string;
  total_duration: number;
  is_published: boolean;
  created_at: string;
  instructor_id: number;
  user: {
    id: number;
    full_name: string;
  };
  categorieName: string;
  enrollmentsCount: number;
}

// Define interface for the API response structure
interface ApiResponse {
  success: boolean;
  data: {
    courses: ApiCourseResponse[];
  };
  message?: string;
}

interface CoursesTableProps {
  onEditCourse: (course: ApiCourseResponse) => void;
}

export default function CoursesTable({ onEditCourse }: CoursesTableProps) {
  const [deleteTargetSlug, setDeleteTargetSlug] = useState<string | null>(null);
  const {
    data: queryData,
    isPending: queryIsPending,
    isLoading: queryIsLoading,
    isError: queryIsError,
    error: queryError,
  } = useFetchUserCourses(); // User removed query/setQuery from hook

  const [courses, setCourses] = useState<ApiCourseResponse[]>([]);
  const [tableIsLoading, setTableIsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeCourseSlug, setActiveCourseSlug] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  const { mutateAsync: removeCourse } = useRemoveCourse();
  const { mutateAsync: changeCourseStatus } = useChangeCourseStatus();
  const { globalSearchQuery } = useSearchContext();

  const handleStatusToggle = useCallback(
    async (courseId: number, newChecked: boolean) => {
      setLoadingIds((prev) => new Set(prev).add(courseId));

      try {
        const res = await changeCourseStatus({
          course_id: courseId,
          is_published: newChecked,
        });

        setCourses((old) =>
          old.map((c) =>
            c.id === courseId ? { ...c, is_published: newChecked } : c
          )
        );
        toast.success(res.message || "Course status updated successfully.");
      } catch (error) {
        toast.error("Failed to update course status.");
        // Revert optimistic update on failure
        setCourses((old) =>
          old.map((c) =>
            c.id === courseId ? { ...c, is_published: !newChecked } : c
          )
        );
      } finally {
        setLoadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
      }
    },
    [changeCourseStatus]
  );

  useEffect(() => {
    console.log("API Response:", queryData);
    if (queryIsLoading || queryIsPending) {
      setTableIsLoading(true);
    } else if (queryIsError) {
      setCourses([]);
      setTableIsLoading(false);
      const errorMessage = (queryError as any)?.response?.data?.message || (queryError as Error)?.message || "Failed to load courses.";
      toast.error(errorMessage);
      console.error('Error fetching courses:', queryError);
    } else if (queryData) {
      // Based on the exact structure from the example
      const typedData = queryData as unknown as ApiResponse;
      if (typedData.success && typedData.data && Array.isArray(typedData.data.courses)) {
        // Set the courses directly from the response structure
        setCourses(typedData.data.courses);
        console.log("Courses loaded:", typedData.data.courses);
        setTableIsLoading(false);
      } else {
        setCourses([]);
        setTableIsLoading(false);
        console.warn('No courses found or unexpected data structure');
      }
    } else {
      // Catch-all for unexpected scenarios
      setCourses([]);
      setTableIsLoading(false);
      console.warn('No data received from API');
    }
  }, [queryData, queryIsLoading, queryIsPending, queryIsError, queryError]);


  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, courseSlug: string) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveCourseSlug(courseSlug);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveCourseSlug(null);
  };

  const handleDeleteCourseRequest = (courseSlug: string) => {
    handleMenuClose();
    setDeleteTargetSlug(courseSlug);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCourseConfirm = async () => {
    if (!deleteTargetSlug) return;
    setIsLoading(true);
    try {
      await removeCourse(deleteTargetSlug);
      setCourses((prev) => prev.filter((c) => c.slug !== deleteTargetSlug));
      alertSuccess("Success", "Course deleted successfully.");
      setIsDeleteModalOpen(false);
      setDeleteTargetSlug(null);
    } catch (error: any) {
      setIsDeleteModalOpen(false);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete course.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCourse = (course: ApiCourseResponse) => {
    handleMenuClose();
    onEditCourse(course);
  };
  

  const columns = useMemo<MRT_ColumnDef<ApiCourseResponse>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Course Title',
      size: 250,
      accessorFn: row => row.title, // This enables filtering/searching by plain title
      Cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
            <Image
              src={row.original.thumbnail_url || '/placeholder-course.webp'}
              alt={row.original.title}
              fill
              className="object-cover"
              unoptimized={!row.original.thumbnail_url}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.title}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Instructor',
      accessorFn: row => row.user.full_name || '—',
      size: 150,
    },
    {
      accessorKey: 'difficulty',
      header: 'Level',
      size: 120,
      Cell: ({ row }) => (
        <span className="capitalize">{row.original.difficulty}</span>
      ),
    },
    {
      accessorKey: 'total_duration',
      header: 'Duration',
      size: 100,
      Cell: ({ row }) => (
        <span>{formatDuration(row.original.total_duration)} </span>
      ),
    },
    {
      accessorKey: 'enrollmentsCount',
      header: 'Enrolled',
      size: 100,
      Cell: ({ row }) => (
        <span>{row.original.enrollmentsCount}</span>
      ),
    },
    {
      accessorKey: 'is_published',
      header: 'Published',
      size: 120,
      Cell: ({ row }) => {
        const course = row.original;
        const isPublished = course.is_published;
        const isLoading = loadingIds.has(course.id);

        return isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : (
          <CustomSwitch
            checked={isPublished}
            onChange={(_, checked) => handleStatusToggle(course.id, checked)}
          />
        );
      },
    },
    {
      accessorKey: 'categorieName',
      header: 'Category',
      size: 150,
      Cell: ({ row }) => (
        <span>{row.original.categorieName || 'Uncategorized'}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created at',
      size: 150,
      Cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <span>
            {date.toISOString().split('T')[0]}
            <br />
            {date.toTimeString().slice(0, 5)}
          </span>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: '',
      size: 10,
      Cell: ({ row }) => (
        <div className="flex justify-center">
          <IconButton
            onClick={(e) => handleMenuOpen(e, row.original.slug)}
            size="small"
          >
            <MoreVertical className="h-5 w-5" />
          </IconButton>
        </div>
      ),
    },
  ], [handleMenuOpen, handleStatusToggle, loadingIds]);
  

  if (queryIsPending || queryIsLoading || isLoading || tableIsLoading) {
    return <AdminSpinner />;
  }

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={courses}
        enableRowSelection={false}
        enablePagination={true}
        enableSearch={true}
      />
       <DeleteConfirmationModal
  open={isDeleteModalOpen}
  onClose={() => {
    setIsDeleteModalOpen(false);
    setDeleteTargetSlug(null);
  }}
  onConfirm={handleDeleteCourseConfirm}
  itemName="Course"
  isLoading={isLoading}
/>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: '150px',
            borderRadius: '8px',
            overflow: 'visible',
            mt: 1,
          },
        }}
      >
        <MenuItem
          sx={{ fontSize: '0.875rem', py: 1 }}
        >
         <Link href={`/intern/course/${activeCourseSlug}`} className="flex items-center gap-1"><Eye className="h-4 w-4 mr-2" />
         See More</Link>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const course = courses.find(c => c.slug === activeCourseSlug);
            if (course) handleEditCourse(course);
          }}
          sx={{ fontSize: '0.875rem', py: 1 }}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </MenuItem>
        <MenuItem
  onClick={() => {
    if (activeCourseSlug) handleDeleteCourseRequest(activeCourseSlug);
  }}
  sx={{ fontSize: '0.875rem', py: 1, color: 'error.main' }}
>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</MenuItem>
      </Menu>
    </div>
  );
}
