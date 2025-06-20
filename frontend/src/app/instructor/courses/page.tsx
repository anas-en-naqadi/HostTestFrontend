"use client"
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import CoursesTable from "@/components/ui/course/CoursesTable";
import { CourseModal } from "@/components/ui/course/CourseModal";
import { useState } from "react";
import { useSearchContext } from "@/contexts/SearchContext";

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
  subtitle?: string;
}

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ApiCourseResponse | undefined>(undefined);
  const { setGlobalSearchQuery } = useSearchContext();
  
  const handleOpenModal = (course?: ApiCourseResponse) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Clear the selected course after a small delay to prevent UI flickering
    setTimeout(() => setSelectedCourse(undefined), 300);
  };

  const handleSearch = (query: string) => {
    setGlobalSearchQuery(query);
  };

  return (
    <div className="w-full overflow-hidden">
      <AdminPageHeader  
        title="Courses"
        showAddButton={true}
        addButtonText="Add Course"
        onAddClick={() => handleOpenModal()}
        searchPlaceholder="Search courses"
        onSearch={handleSearch}
      />
      <CoursesTable 
        onEditCourse={handleOpenModal}
      />
      <CourseModal
        open={isModalOpen}
        onClose={handleCloseModal}
        course={selectedCourse}
        title={`${selectedCourse?.id ? "Edit Course" : "Add New Course"}`}
      />
    </div>
  );
}
