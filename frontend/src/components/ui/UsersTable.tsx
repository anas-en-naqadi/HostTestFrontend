// src/components/ui/UsersTable.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Trash2, Loader2, PencilLine } from "lucide-react";
import { useFetchUsers } from "@/lib/hooks/user-management/useFetchUsers";
import { useChangeStatus } from "@/lib/hooks/user-management/useChangeStatus";
import { useRemoveUser } from "@/lib/hooks/user-management/useRemoveUser";
import { useEditUser } from "@/lib/hooks/user-management/useEditUser";
import { alertConfirm, alertSuccess } from "@/utils/alert";
import { formatDate } from "@/utils/formatDate";
import { User, ApiUser } from "@/types/user.types";
import { MRT_ColumnDef } from "material-react-table";
import { CustomSwitch } from "./CustomSwitch";
import DataTable from "../common/DataTable";
import { toast } from "sonner";

interface UsersTableProps {
  onEditUser: (user: ApiUser) => void;
}

export default function UsersTable({ onEditUser }: UsersTableProps) {
  const { data, isPending } = useFetchUsers();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const { mutateAsync: changeUserStatus } = useChangeStatus();
  const { mutateAsync: removeUser } = useRemoveUser();
  const { mutateAsync: editUser } = useEditUser();

  useEffect(() => {
    if (data) setUsers(data.data);
  }, [data]);

  const handleStatusToggle = useCallback(
    async (userId: string, newChecked: boolean) => {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });

      const status = newChecked ? "active" : "inactive";

      try {
        await changeUserStatus({
          user_id: parseInt(userId),
          status: newChecked,
        }).then(async (res) => toast.success(res.message));

        setUsers((old) =>
          old.map((u) => (u.id === userId ? { ...u, status: status } : u))
        );
      } catch (error) {
        toast.error("Failed to update user status.");
        // Revert optimistic update on failure
        setUsers((old) =>
          old.map((u) =>
            u.id === userId ? { ...u, status: newChecked ? "active" : "inactive" } : u
          )
        );
      } finally {
        setLoadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return new Set(newSet);
        });
      }
    },
    [changeUserStatus]
  );

  const handleEditUser = (id: string) => {
    // Find the user in the current users array instead of making an API call
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      // Convert User type to ApiUser type before passing to onEditUser
      // Log the user data to debug the structure
      console.log('User data from table:', userToEdit);
      
      // Create a base user object
      const apiUser: ApiUser = {
        id: parseInt(userToEdit.id),
        full_name: userToEdit.full_name,
        username: userToEdit.username,
        email: userToEdit.email,
        role: userToEdit.role,
        status: userToEdit.status === 'active',
      };
      
      // Add instructor data if available
      if (userToEdit.instructor) {
        apiUser.description = userToEdit.instructor.description;
        apiUser.specialization = userToEdit.instructor.specialization;
      }
      
      // Pass the converted user data to onEditUser
      onEditUser(apiUser);
    } else {
      // Fallback to API call only if user is not found in the current data
      setIsLoading(true);
      editUser(parseInt(id))
        .then((res) => {
          onEditUser(res.data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const ok = await alertConfirm(
      "Confirm Delete?",
      "Are you sure you want to delete this user? This action cannot be undone."
    );
    if (!ok) return;
    setIsLoading(true);
    removeUser(parseInt(userId))
      .then((res) => {
        alertSuccess("Success", res.message);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      })
      .finally(() => setIsLoading(false));
  };

  const columns: MRT_ColumnDef<User>[] = useMemo(
    () => [
      { accessorKey: "full_name", header: "Full Name" },
      { accessorKey: "username", header: "User Name" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Role",
        Cell: ({ row }) => {
          const role = row.original.role;
          const base =
            "px-3 py-1 text-center rounded-full text-sm font-semibold";
          const classes: { [key: string]: string } = {
            admin: "bg-red-100 text-red-800",
            instructor: "bg-blue-100 text-blue-800",
            intern: "bg-green-100 text-green-800",
          };
          return (
           <div className="flex items-center justify-center">
             <span
              className={`${base} ${
                classes[role] ?? "bg-gray-100 text-gray-800"
              }`}
            >
              {role}
            </span>
           </div>
          );
        },
      },
      {
        accessorKey: "last_login",
        header: "Last Login",
        Cell: ({ cell }) => formatDate(cell.getValue<string | Date>()),
      },
      {
        accessorKey: "created_at",
        header: "Joined at",
        Cell: ({ cell }) => formatDate(cell.getValue<string | Date>()),
      },
      {
        accessorKey: "updated_at",
        header: "Updated at",
        Cell: ({ cell }) => formatDate(cell.getValue<string | Date>()),
      },
      {
        accessorKey: "status",
        header: "Account State",
        size: 100,
        Cell: ({ row }) => {
          const user = row.original;
          const isActive = user.status === "active";
          const isLoading = loadingIds.has(user.id);

          return isLoading ? (
            <Loader2 className="animate-spin text-gray-400" size={24} />
          ) : (
            <CustomSwitch
              sx={{ mx: "auto" }}
              checked={isActive}
              onChange={(_, checked) => handleStatusToggle(user.id, checked)}
            />
          );
        },
        
      },
    ],
    [loadingIds, handleStatusToggle]
  );

  const actionButtons = useMemo(
    () => [
      {
        icon: (
          <PencilLine
            size={32}
            strokeWidth={3}
            className="text-[#8C8FA5] hover:text-white hover:bg-[#8C8FA5] transition-colors duration-200 cursor-pointer border-2 p-1 rounded-full border-[#8C8FA5]"
          />
        ),
        onClick: (user: User) => handleEditUser(user.id),
        tooltip: "Edit user",
      },
      {
        icon: (
          <Trash2
            size={32}
            strokeWidth={3}
            className="text-[#FF0000] hover:text-white hover:bg-[#FF0000] border-2 p-1 rounded-full border-[#FF0000] transition-colors duration-200 cursor-pointer"
          />
        ),
        onClick: (user: User) => handleDeleteUser(user.id),
        color: "error",
        tooltip: "Delete user",
      },
    ],
    [handleDeleteUser]
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      isPending={isPending}
      actionButtons={actionButtons}
    />
  );
}
