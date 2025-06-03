"use client";

import { useState, useEffect, useMemo } from "react";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { DataTable } from "@/components/common/DataTable";
import { useFetchActivityLogs } from "@/lib/hooks/useFetchActivityLogs";
import { MRT_ColumnDef } from "material-react-table";
import { formatDate } from "@/utils/formatDate";

// Define the ActivityLog interface from original ActivityLogsTable
interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  details?: string;
  ip_address?: string;
  created_at: string;
  actor_full_name: string;
  actor_role: string;
}

export default function ActivityLogsPage() {
  const [sortBy, setSortBy] = useState<
    "created_at" | "activity_type" | "actor_full_name"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { activityLogs, isLoading, error, fetchActivityLogs } =
    useFetchActivityLogs();

  useEffect(() => {
    fetchActivityLogs(sortBy, sortOrder);
  }, [fetchActivityLogs, sortBy, sortOrder]);

  // Define columns for DataTable component
  const columns = useMemo<MRT_ColumnDef<ActivityLog>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
      },
      {
        accessorKey: "created_at",
        header: "Timestamp",
        size: 160,
        Cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          return (
            <div>
              <div className="font-medium">{formatDate(date)}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "actor_full_name",
        header: "User",
        size: 150,
        Cell: ({ row }) => {
          const userRole = row.original.actor_role;
          let roleClassName = "px-2 py-1 rounded-full text-xs font-medium ";

          // Add styling for different roles
          switch (userRole) {
            case "admin":
              roleClassName += "bg-red-100 text-red-800";
              break;
            case "instructor":
              roleClassName += "bg-blue-100 text-blue-800";
              break;
            case "intern":
              roleClassName += "bg-green-100 text-green-800";
              break;
            default:
              roleClassName += "bg-gray-100 text-gray-800";
          }

          return (
            <div>
              <div className="font-medium">{row.original.actor_full_name}</div>
              <span className={roleClassName}>{userRole.toLowerCase()}</span>
            </div>
          );
        },
      },
      {
  accessorKey: "activity_type",
  header: "Activity Type",
  size: 150,
  Cell: ({ row }) => {
    const activityType = row.original.activity_type;
    let className = "px-2 py-1 rounded-full text-xs font-medium ";
    switch (activityType) {
      // User related activities
      case "USER_LOGIN":
        className += "bg-blue-100 text-blue-800";
        break;
      case "USER_LOGOUT":
        className += "bg-gray-100 text-gray-800";
        break;
      case "USER_CREATED":
        className += "bg-green-100 text-green-800";
        break;
      case "USER_UPDATED":
        className += "bg-yellow-100 text-yellow-800";
        break;
      case "USER_REGISTER":
        className += "bg-indigo-100 text-indigo-800";
        break;
      case "USER_EMAIL_VERIFIED":
        className += "bg-sky-100 text-sky-800";
        break;
      case "USER_VIEWED":
        className += "bg-slate-100 text-slate-800";
        break;
      case "USER_LIST_VIEW":
        className += "bg-slate-200 text-slate-900";
        break;
      case "USER_STATUS_CHANGED":
        className += "bg-amber-300 text-amber-950";
        break;
      case "USER_DELETED":
        className += "bg-red-300 text-red-950";
        break;
      case "PROFILE_UPDATED":
        className += "bg-yellow-300 text-yellow-950";
        break;
      
      // Course related activities
      case "COURSE_ENROLLMENT":
        className += "bg-purple-100 text-purple-800";
        break;
      case "COURSE_COMPLETION":
        className += "bg-teal-100 text-teal-800";
        break;
      case "COURSE_LIST":
        className += "bg-amber-100 text-amber-800";
        break;
      case "COURSE_WATCH":
        className += "bg-cyan-100 text-cyan-800";
        break;
      case "COURSE_ENROLL":
        className += "bg-emerald-100 text-emerald-800";
        break;
      case "COURSE_VIEW":
        className += "bg-lime-100 text-lime-800";
        break;
      case "COURSE_CREATED":
        className += "bg-green-300 text-green-950";
        break;
      case "COURSE_UPDATED":
        className += "bg-yellow-400 text-yellow-950";
        break;
      case "COURSE_DELETED":
        className += "bg-red-400 text-red-950";
        break;
      case "USER_COURSES_LIST":
        className += "bg-lime-300 text-lime-950";
        break;
      
      // Wishlist related activities
      case "WISHLIST_ADD":
        className += "bg-pink-100 text-pink-800";
        break;
      case "WISHLIST_REMOVE":
        className += "bg-red-100 text-red-800";
        break;
      case "WISHLIST_LIST":
        className += "bg-rose-100 text-rose-800";
        break;
      
      // Enrollment related activities
      case "ENROLLMENT_LIST_VIEW":
        className += "bg-violet-100 text-violet-800";
        break;
      
      // Lesson progress related activities
      case "LESSON_PROGRESS_CREATE":
        className += "bg-blue-200 text-blue-900";
        break;
      case "LESSON_PROGRESS_RESET":
        className += "bg-blue-300 text-blue-950";
        break;
      
      // Note related activities
      case "NOTE_CREATE":
        className += "bg-yellow-200 text-yellow-900";
        break;
      case "NOTE_UPDATE":
        className += "bg-amber-200 text-amber-900";
        break;
      
      // Quiz related activities
      case "QUIZ_LISTED":
        className += "bg-purple-200 text-purple-900";
        break;
      case "QUIZ_UPDATED":
        className += "bg-indigo-200 text-indigo-900";
        break;
      case "QUIZ_DELETED":
        className += "bg-red-200 text-red-900";
        break;
      case "QUIZ_CREATED":
        className += "bg-green-200 text-green-900";
        break;
      case "QUIZ_ATTEMPT_CREATE":
        className += "bg-orange-200 text-orange-900";
        break;
      case "QUIZ_VIEWED":
        className += "bg-purple-300 text-purple-950";
        break;
      case "QUIZ_ANSWERS_SUBMITTED":
        className += "bg-indigo-300 text-indigo-950";
        break;
      case "QUIZ_QUESTION_DELETED":
        className += "bg-red-300 text-red-950";
        break;
      case "QUIZ_OPTION_DELETED":
        className += "bg-red-200 text-red-900";
        break;
      case "USER_ANSWER_SUBMITTED":
        className += "bg-orange-300 text-orange-950";
        break;
      
      // Category related activities
      case "CATEGORY_LISTED":
        className += "bg-teal-200 text-teal-900";
        break;
      case "CATEGORY_UPDATED":
        className += "bg-cyan-200 text-cyan-900";
        break;
      case "CATEGORY_CREATED":
        className += "bg-emerald-200 text-emerald-900";
        break;
      case "CATEGORY_DELETED":
        className += "bg-red-200 text-red-900";
        break;
      case "CATEGORY_VIEWED":
        className += "bg-teal-300 text-teal-950";
        break;
      
      // Announcement related activities
      case "ANNOUNCEMENTS_LISTED":
        className += "bg-fuchsia-100 text-fuchsia-800";
        break;
      case "ANNOUNCEMENTS_UPDATED":
        className += "bg-fuchsia-200 text-fuchsia-900";
        break;
      case "ANNOUNCEMENTS_DELETED":
        className += "bg-fuchsia-300 text-fuchsia-950";
        break;
      case "ANNOUNCEMENTS_CREATED":
        className += "bg-pink-200 text-pink-900";
        break;
      
      // Role and permission related activities
      case "ROLE_CREATED":
        className += "bg-sky-200 text-sky-900";
        break;
      case "ROLE_UPDATED":
        className += "bg-sky-300 text-sky-950";
        break;
      case "ROLE_DELETED":
        className += "bg-red-300 text-red-950";
        break;
      case "ROLE_PERMISSIONS_ASSIGNED":
        className += "bg-emerald-300 text-emerald-950";
        break;
      case "ROLE_PERMISSIONS_REVOKED":
        className += "bg-amber-300 text-amber-950";
        break;
      case "PERMISSIONS_LISTED":
        className += "bg-sky-100 text-sky-800";
        break;
      case "PERMISSION_VIEWED":
        className += "bg-sky-200 text-sky-900";
        break;
      
      // Notification related activities
      case "NOTIFICATIONS_VIEWED":
        className += "bg-violet-200 text-violet-900";
        break;
      case "NOTIFICATIONS_MARKED_READ":
        className += "bg-violet-300 text-violet-950";
        break;
      case "NOTIFICATIONS_CLEARED":
        className += "bg-violet-400 text-violet-950";
        break;
      
      // Dashboard related activities
      case "ADMIN_DASHBOARD_STATS_VIEW":
        className += "bg-slate-300 text-slate-950";
        break;
      case "ADMIN_POPULAR_COURSES_VIEW":
        className += "bg-slate-400 text-slate-950";
        break;
      case "ADMIN_PERFORMANCE_GRAPHS_VIEW":
        className += "bg-slate-500 text-white";
        break;
      case "INSTRUCTOR_DASHBOARD_STATS_VIEW":
        className += "bg-blue-400 text-blue-950";
        break;
      case "INSTRUCTOR_DASHBOARD_COMPLETE_VIEW":
        className += "bg-blue-600 text-white";
        break;
      case "INSTRUCTOR_PERFORMANCE_GRAPHS_VIEW":
        className += "bg-blue-500 text-white";
        break;
      case "INSTRUCTOR_POPULAR_COURSES_VIEW":
        className += "bg-blue-300 text-blue-950";
        break;
      case "INTERN_DASHBOARD_VIEW":
        className += "bg-green-400 text-green-950";
        break;
      case "INTERN_DASHBOARD_COMPLETE_VIEW":
        className += "bg-green-600 text-white";
        break;
      
      // Certificate related activities
      case "CERTIFICATE_CREATED":
        className += "bg-amber-400 text-amber-950";
        break;
      case "CERTIFICATE_DOWNLOADED":
        className += "bg-amber-500 text-white";
        break;
      case "CERTIFICATES_VIEWED":
        className += "bg-amber-300 text-amber-950";
        break;
      
      default:
        className += "bg-gray-100 text-gray-800";
    }
    
    return <span className={className}>{activityType}</span>;
  },
},
      {
        accessorKey: "details",
        header: "Details",
        size: 300,
      },
      {
        accessorKey: "ip_address",
        header: "IP",
        size: 100,
        Cell: ({ cell }) => (
          <div className="ml-4">{cell.getValue() as string}</div>
        ),
        Header: () => <div className="ml-4">IP</div>,
      },
    ],
    []
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageHeader
        title="ACTIVITYLOGS"
        showAddButton={false}
        searchPlaceholder="Search activity log"
      />

      {error && (
        <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">
          Error loading activity logs: {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={activityLogs || []}
        isLoading={isLoading}
        enableSearch={true}
      />
    </div>
  );
}
