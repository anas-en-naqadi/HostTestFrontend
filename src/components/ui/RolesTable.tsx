"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { CheckCircle2, MoreVertical, Pencil, Trash2, XCircle } from "lucide-react";
import { useFetchRoles } from "@/lib/hooks/role-management/useFetchRoles";
import { useRemoveRole } from "@/lib/hooks/role-management/useRemoveRole";
import { alertConfirm, alertSuccess } from "@/utils/alert";
import { Role, ApiRole } from "@/types/role.types";
import { MRT_ColumnDef } from "material-react-table";
import DataTable from "../common/DataTable";
import { PermissionsModal } from "./PermissionsModal";
import { Menu, MenuItem, IconButton, Popper, Paper, ClickAwayListener, MenuList, Grow } from "@mui/material";
import { toast } from "sonner";
import AdminSpinner from "../common/AdminSpinnter";

interface RolesTableProps {
  onEditRole: (role: ApiRole) => void;
}

export default function RolesTable({ onEditRole }: RolesTableProps) {
  const { data, isPending, isLoading: rolesLoading, refetch } = useFetchRoles();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [permissionsMode, setPermissionsMode] = useState<"assign" | "revoke">("assign");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null);
  
  const { mutateAsync: removeRole } = useRemoveRole();

  // Update roles when data changes
  useEffect(() => {
    if (data?.success && Array.isArray(data.data)) {
      setIsLoading(true);
      // Deep clone the data to avoid reference issues
      setTimeout(() => {
        const processedRoles = JSON.parse(JSON.stringify(data.data));
        setRoles(processedRoles);
        setIsLoading(false);
      }, 100);
    }
  }, [data]);
  
  // Fetch roles data when component mounts with a reduced refresh interval
  useEffect(() => {
    // Initial fetch
    const fetchRolesData = async () => {
      setIsLoading(true);
      try {
        await refetch();
        console.log('Roles data refreshed');
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to load roles. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch immediately on mount
    fetchRolesData();
    
    // Set up a refresh interval (every 60 seconds instead of 10 to reduce API calls)
    const refreshInterval = setInterval(() => {
      // Only refresh if the component is visible
      if (document.visibilityState === 'visible') {
        refetch().catch(err => console.error('Background refresh error:', err));
      }
    }, 60000); // Changed from 10000 to 60000 (1 minute)
    
    // Clean up the interval on unmount
    return () => clearInterval(refreshInterval);
  }, [refetch]);

  const handleEditRole = (role: Role) => {
    onEditRole(role as ApiRole);
  };

  const handleDeleteRole = async (roleId: number) => {
    const ok = await alertConfirm(
      "Confirm Delete?",
      "Are you sure you want to delete this role? This action cannot be undone."
    );
    if (!ok) return;
    
    setIsLoading(true);
    try {
      const res = await removeRole(roleId);
      alertSuccess("Success", res.message);
      
      // Ensure we have the latest data after deletion
      await refetch();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, role: Role) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveRoleId(role.id);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveRoleId(null);
  };

  const handleOpenPermissionsModal = (role: Role, mode: "assign" | "revoke") => {
    setSelectedRole(role);
    setPermissionsMode(mode);
    setPermissionsModalOpen(true);
  };

  const columns: MRT_ColumnDef<Role>[] = useMemo(
    () => [
      { accessorKey: "name", header: "Role Name" },
      { accessorKey: "description", header: "Description",Cell: ({ row }) => row.original.description || <span className="text-gray-400">No description</span> },
      { 
        accessorKey: "permissions", 
        header: "Permissions",
        Cell: ({ row }) => {
          const rolePermissions = row.original.permissions;
          if (!rolePermissions || rolePermissions.length === 0) {
            return <span className="text-gray-400">No permissions</span>;
          }
          console.log("role",rolePermissions)
          return (
            <div className="flex flex-wrap gap-1">
              {rolePermissions.map((rolePermission, index) => (
                <span 
                  key={rolePermission.id} 
                  className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mb-1"
                >
                  {rolePermission.name}
                </span>
              ))}
            </div>
          );
        },
      },
    ],
    []
  );

  const actionButtons = useMemo(() => [
    {
      icon: <span className="rouned-lg cursor-pointer w-[100px] h-[26px] gap-1 text-white custom-blue-bg flex items-center justify-center rounded-xl p-2 text-sm font-medium"><CheckCircle2 size={14} />Assign</span>,
      onClick: (role: Role) => handleOpenPermissionsModal(role, "assign"),
      tooltip: "Assign permissions",
    },
    {
      icon: <span className="rouned-lg cursor-pointer w-[100px] h-[26px] gap-1 text-[#8C8FA5] border-1 mr-4 border-[#8C8FA5] flex items-center justify-center rounded-xl p-2 text-sm font-medium"><XCircle size={14} />Revoke</span>,
      onClick: (role: Role) => handleOpenPermissionsModal(role, "revoke"),
      tooltip: "Revoke permissions",
    },
    {
      icon: <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}><MoreVertical size={14} className="text-[#8C8FA5] cursor-pointer text-gray-500 rounded-full"/></IconButton>,
      onClick: (role: Role, event?: React.MouseEvent<HTMLElement>) => {
        if (event) {
          handleOpenMenu(event, role);
        }
      },
      tooltip: "More options",
      disableHover: true,
    },
  ], []);
// Show loading spinner when data is initially loading or during operations
if(rolesLoading || isLoading) return <AdminSpinner />
  return (
    <>
      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        isPending={isPending}
        actionButtons={actionButtons}
      />
      
      {/* Dropdown Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          className: "w-[169px] mt-1"
        }}
        elevation={2}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => {
            const role = roles.find(r => r.id === activeRoleId);
            if (role) handleEditRole(role);
            handleCloseMenu();
          }}
          className="flex items-center gap-2 text-base font-normal"
        >
          <Pencil size={18} className="text-[#8C8FA5]" />
          <span className="text-[#8C8FA5]">Edit </span>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (activeRoleId) handleDeleteRole(activeRoleId);
            handleCloseMenu();
          }}
          className="flex items-center gap-2 text-base"
        >
          <Trash2 size={18} className="text-red-600" />
          <span className="text-red-600">Delete </span>
        </MenuItem>
      </Menu>

      {/* Permissions Modal */}
      {selectedRole && (
        <PermissionsModal
          open={permissionsModalOpen}
          onClose={() => {
            setPermissionsModalOpen(false);
            setTimeout(() => setSelectedRole(null), 300);
          }}
          role={selectedRole as ApiRole}
          title={permissionsMode === "assign" ? "Assign Permissions" : "Revoke Permissions"}
          mode={permissionsMode}
        />
      )}
    </>
  );
}