"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { X } from "lucide-react";
import { Announcement } from "@/types/announcement.types";
import RichTextEditor from "../features/RichInput";

interface AnnouncementModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (announcement: Partial<Announcement>) => Promise<void>;
  initialData: Partial<Announcement> | null;
  isLoading: boolean;
  courses?: Array<{ id: number; title: string }>;
}

export default function AnnouncementModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  courses = [],
}: AnnouncementModalProps) {
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: "",
    content: "",
    courseId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        content: initialData.content || "",
        courseId: initialData.courseId || 0,
      });
    } else {
      setFormData({
        title: "",
        content: "",
        courseId: 0,
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content?.trim()) {
      newErrors.content = "Content is required";
    }

    // Only validate courseId if this is a new announcement
    if (!initialData && (!formData.courseId || formData.courseId === 0)) {
      newErrors.courseId = "Please select a course";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "courseId" ? parseInt(value, 10) : value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting content:", formData.content);

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          paddingY: "2rem",
          paddingX: "1.5rem",
        },
      }}
    >
      <DialogTitle className="flex justify-between items-center pb-4">
        <span className="text-lg  sm:text-[22px] font-semibold text-[#136A86]">
          {initialData ? "Edit Announcement" : "Add Announcement"}
        </span>
        {!isLoading && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X size={30} className="border rounded-full p-0.5" />
          </button>
        )}
      </DialogTitle>

      <DialogContent className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-[12px] sm:text-base font-medium"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full sm:h-12 p-2 outline-none border max-w-[839px] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter announcement title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2 max-w-[839px]">
            <label
              htmlFor="content"
              className="block text-[12px] sm:text-base font-medium"
            >
              Content
            </label>
            <RichTextEditor
              initialValue={formData.content || ""}
              onChange={(html) => {
                setFormData((prev) => ({ ...prev, content: html }));
                if (errors.content) {
                  setErrors((prev) => ({ ...prev, content: "" }));
                }
              }}
              maxChars={2000}
              placeholder="Write your announcement content here..."
              maxWidth="max-4-xl"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="courseId"
              className="block text-[12px] sm:text-base font-medium"
            >
              Course
            </label>
            {courses.length === 0 ? (
              <p className="text-red-500">
                You have no courses to create announcements for
              </p>
            ) : (
              <div className="relative">
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId || ""}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full sm:h-12 p-2 text-[#8C8FA5] border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                    errors.courseId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {initialData ? (
                    <option value={initialData.courseId}>
                      {initialData.courses?.title}
                    </option>
                  ) : (
                    <option value="">Select a course</option>
                  )}
                  {courses
                    .filter(
                      (course) =>
                        !initialData || course.id !== initialData.courseId
                    )
                    .map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#404040]">
                  <svg
                    className="fill-current h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            )}
            {errors.courseId && (
              <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>
            )}
          </div>
        </form>
      </DialogContent>

      <DialogActions className="px-6 pb-4 pt-2">
        <div className="flex gap-4 w-full justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:max-w-40 sm:h-12 py-2 px-4 rounded-md text-[#136A86] cursor-pointer hover:text-[#5CB5BD] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 sm:max-w-40 sm:h-12 mr-3.5 py-2 px-4 bg-[#136A86] text-white rounded-md hover:bg-[#5CB5BD] font-semibold cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span>{initialData ? "Edit" : "Add"}</span>
            )}
          </button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
