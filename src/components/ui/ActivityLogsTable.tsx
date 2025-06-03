"use client";

import { useState, useMemo } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_SortingState,
} from "material-react-table";
import {formatDate} from "@/utils/formatDate";

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  details?: string;
  ip_address?: string;
  created_at: string;
  actor_full_name: string;
  actor_role: string; // Added role field
}

interface ActivityLogsTableProps {
  logs: ActivityLog[];
  isLoading?: boolean;
  onSortChange?: (
    sortBy: "created_at" | "activity_type" | "actor_full_name",
    sortOrder: "asc" | "desc"
  ) => void;
}

export default function ActivityLogsTable({
  logs = [],
  isLoading = false,
  onSortChange,
}: ActivityLogsTableProps) {
  const [sorting, setSorting] = useState<MRT_SortingState>([
    { id: 'created_at', desc: true } // Default sort by timestamp descending
  ]);

  const columns = useMemo<MRT_ColumnDef<ActivityLog>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
        enableSorting: true,
      },
      {
        accessorKey: "created_at",
        header: "Timestamp",
        size: 160,
        enableSorting: true,
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
        enableSorting: true,
        Cell: ({ row }) => {
            const userRole = row.original.actor_role;
            let roleClassName = "px-2 py-1 rounded-full text-xs font-medium ";
            
            // Add styling for different roles
            switch(userRole) {
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
          }
      },
      {
        accessorKey: "activity_type",
        header: "Activity Type",
        size: 150,
        enableSorting: true,
        Cell: ({ row }) => {
          const activityType = row.original.activity_type;
          let className = "px-2 py-1 rounded-full text-xs font-medium ";
          
          switch(activityType) {
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
            case "COURSE_ENROLLMENT":
              className += "bg-purple-100 text-purple-800";
              break;
            case "COURSE_COMPLETION":
              className += "bg-teal-100 text-teal-800";
              break;
            case "WISHLIST_ADD":
              className += "bg-pink-100 text-pink-800";
              break;
            case "WISHLIST_REMOVE":
              className += "bg-red-100 text-red-800";
              break;
            case "USER_REGISTER":
              className += "bg-indigo-100 text-indigo-800";
              break;
            case "ENROLLMENT_LIST_VIEW":
              className += "bg-violet-100 text-violet-800";
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
        enableSorting: false,
      },
      {
        accessorKey: "ip_address",
        header: "IP",
        size: 120,
        enableSorting: false,
      },
    ],
    []
  );

  return (
    <div className="overflow-x-auto shadow-lg">
      <MaterialReactTable
        columns={columns}
        data={logs}
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

          if (newSorting.length > 0 && onSortChange) {
            const sort = newSorting[0];
            const sortBy = sort.id as "created_at" | "activity_type" | "actor_full_name";
            const sortOrder = sort.desc ? "desc" : "asc";
            onSortChange(sortBy, sortOrder);
          }
        }}
      />
    </div>
  );
}