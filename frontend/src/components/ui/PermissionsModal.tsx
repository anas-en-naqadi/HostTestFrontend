"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Typography, Autocomplete, TextField, Chip } from "@mui/material";
import { Loader2 } from "lucide-react";
import { ApiRole, Permission } from "@/types/role.types";
import { useFetchPermissions } from "@/lib/hooks/permission-management/useFetchPermissions";
import { assignPermissions, revokePermissions } from "@/lib/api/role-management";
import { alertSuccess } from "@/utils/alert";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PermissionsModalProps {
  open: boolean;
  onClose: () => void;
  role?: ApiRole;
  title: string;
  mode: "assign" | "revoke";
}

export function PermissionsModal({ open, onClose, role, title, mode }: PermissionsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const queryClient = useQueryClient();
  
  const { data: permissionsData, isPending } = useFetchPermissions();
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

  // Initialize available permissions and selected permissions
  useEffect(() => {
    // Reset states when modal opens/closes or role changes
    if (!open) {
      setAvailablePermissions([]);
      setSelectedPermissions([]);
      return;
    }
    
    // Handle case when permissions data or role is not available yet
    if (!permissionsData || !permissionsData.data || !role) {
      setAvailablePermissions([]);
      setSelectedPermissions([]);
      return;
    }
    
    // Type assertion to ensure TypeScript knows the structure
    const permissionsDataTyped = permissionsData as { data: Permission[] };
    
    // Use a local variable to track if the component is mounted
    // This prevents state updates after the component unmounts
    let isMounted = true;
    
    const processPermissions = () => {
      try {
        if (mode === "assign") {
          // For assign mode, filter out permissions that are already assigned to the role
          // Handle case when permissions is undefined or empty
          if (!role.permissions) {
            // If no permissions are assigned yet, all permissions are available
            if (isMounted) setAvailablePermissions(permissionsDataTyped.data || []);
          } else {
            const rolePermissionIds = role.permissions
              .filter(rp => rp && rp.id) // Ensure valid permissions objects
              .map(rp => rp.id)
              .filter(Boolean) as number[]; // Filter out undefined/null IDs and assert type
              
            if (isMounted) {
              setAvailablePermissions(
                permissionsDataTyped.data.filter((p: Permission) => p.id && !rolePermissionIds.includes(p.id))
              );
            }
          }
        } else {
          // For revoke mode, only show permissions that are already assigned to the role
          if (!role.permissions || role.permissions.length === 0) {
            if (isMounted) setAvailablePermissions([]);
            // Show a message if there are no permissions to revoke
            if (open && mode === "revoke") {
              toast.info("This role has no permissions to revoke");
            }
          } else {
            const validPermissions = role.permissions
              .filter(rp => rp && rp.id) // Ensure valid permissions objects
              .map(rp => rp)
              .filter(Boolean) as Permission[]; // Filter out undefined permissions and assert type
              
            if (isMounted) setAvailablePermissions(validPermissions);
          }
        }
        // Reset selected permissions when role or mode changes
        if (isMounted) setSelectedPermissions([]);
      } catch (error) {
        console.error("Error processing permissions:", error);
        if (isMounted) {
          toast.error("An error occurred while loading permissions");
          setAvailablePermissions([]);
          setSelectedPermissions([]);
        }
      }
    };
    
    // Process permissions only once per effect run
    processPermissions();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [permissionsData, role, mode, open]);

  const handleSave = async () => {
    // Validate role exists
    if (!role) {
      toast.error("No role selected");
      return;
    }
    
    // Validate permissions are selected
    if (selectedPermissions.length === 0) {
      toast.error(`Please select permissions to ${mode}`);
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    let isComponentMounted = true; // Track component mount state

    try {
      // Filter out permissions without IDs and convert to numbers
      const permissionIds = selectedPermissions
        .map(p => p.id)
        .filter((id): id is number => id !== undefined && id !== null)
        .map(id => Number(id));
      
      // Validate filtered permissions
      if (permissionIds.length === 0) {
        toast.error("No valid permissions selected");
        if (isComponentMounted) setIsSubmitting(false);
        return;
      }
      
      // Create a timeout to detect long-running operations
      const timeoutId = setTimeout(() => {
        if (isComponentMounted) {
          toast.info(`${mode === "assign" ? "Assigning" : "Revoking"} permissions is taking longer than expected. Please wait...`);
        }
      }, 3000);
      
      try {
        let response;
        if (mode === "assign") {
          // Assign permissions
          response = await assignPermissions(role.id, permissionIds);
          if (!response || !response.success) {
            throw new Error(response?.message || "Failed to assign permissions");
          }
          // Close modal first before showing success message
          if (isComponentMounted) {
            onClose();
            alertSuccess("Success", response.message || "Permissions assigned successfully");
          }
        } else {
          // Revoke permissions
          response = await revokePermissions(role.id, permissionIds);
          if (!response || !response.success) {
            throw new Error(response?.message || "Failed to revoke permissions");
          }
          // Close modal first before showing success message
          if (isComponentMounted) {
            onClose();
            alertSuccess("Success", response.message || "Permissions revoked successfully");
          }
        }
        
        // Clear the timeout since operation completed
        clearTimeout(timeoutId);
        
        // Force refresh data with retry mechanism
        try {
          // Complete invalidation of all queries to ensure fresh data
          await queryClient.invalidateQueries();
          
          // Force immediate refetch of specific queries
          const forceRefetch = async () => {
            // First, directly refetch the roles and permissions
            try {
              await Promise.all([
                queryClient.refetchQueries({ queryKey: ['roles'], type: 'active' }),
                queryClient.refetchQueries({ queryKey: ['permissions'], type: 'active' })
              ]);
              
              // Then, reset the query cache for these queries to force a complete refresh
              queryClient.resetQueries({ queryKey: ['roles'] });
              queryClient.resetQueries({ queryKey: ['permissions'] });
              
              // Finally, refetch again to ensure fresh data
              await Promise.all([
                queryClient.refetchQueries({ queryKey: ['roles'], exact: true }),
                queryClient.refetchQueries({ queryKey: ['permissions'], exact: true })
              ]);
            } catch (err) {
              console.error("Error in first refetch attempt:", err);
              // Try one more time after a short delay
              await new Promise(resolve => setTimeout(resolve, 500));
              await Promise.all([
                queryClient.refetchQueries({ queryKey: ['roles'], exact: true }),
                queryClient.refetchQueries({ queryKey: ['permissions'], exact: true })
              ]);
            }
          };
          
          // Execute the force refetch
          await forceRefetch();
          
          // Wait a moment and then refetch one more time to ensure data is up-to-date
          setTimeout(() => {
            queryClient.refetchQueries({ queryKey: ['roles'] });
            queryClient.refetchQueries({ queryKey: ['permissions'] });
          }, 1000);
          
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError);
          // Don't show this error to the user as the operation succeeded
          // But log it for debugging purposes
        }
        
        // Modal already closed before showing success message
        // No need to close it again here
      } catch (operationError) {
        // Clear the timeout if there's an error
        clearTimeout(timeoutId);
        
        console.error(`Error ${mode}ing permissions:`, operationError);
        if (isComponentMounted) {
          toast.error(
            typeof operationError === 'object' && operationError !== null && 'message' in operationError
              ? String(operationError.message)
              : `Failed to ${mode} permissions. Please try again.`
          );
        }
      }
    } catch (error) {
      console.error(`Unexpected error during ${mode} operation:`, error);
      if (isComponentMounted) {
        toast.error(`An unexpected error occurred. Please try again.`);
      }
    } finally {
      // Only update state if component is still mounted
      if (isComponentMounted) {
        setIsSubmitting(false);
      }
      
      // Cleanup function to update mount state
      return () => {
        isComponentMounted = false;
      };
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" className="font-sans">
      <DialogTitle>
        <div className="text-[#136A86] text-xl font-bold">
          {title}
        </div>
      </DialogTitle>
      <DialogContent dividers>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSave(); }} 
          className="space-y-5 px-6"
        >
          <div>
            <label className="font-medium text-base block text-gray-700 mb-3">
              {mode === "assign" ? "Select Permissions to Assign" : "Select Permissions to Revoke"}
            </label>
            
            {isPending ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-[#136A86]" size={30} />
              </div>
            ) : (
              <Autocomplete
                multiple
                id="permissions-autocomplete"
                options={availablePermissions}
                getOptionLabel={(option) => option.name}
                value={selectedPermissions}
                onChange={(_, newValue) => setSelectedPermissions(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder={mode === "assign" ? "Select permissions to assign" : "Select permissions to revoke"}
                    fullWidth
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const tagProps = getTagProps({ index });
                    // Extract key from props to avoid React warning
                    const { key, ...otherProps } = tagProps;
                    return (
                      <Chip
                        key={key}
                        label={option.name}
                        {...otherProps}
                        className="bg-blue-100 text-blue-800"
                      />
                    );
                  })
                }
                className="mb-4"
              />
            )}
          </div>
          
          <div className="flex text-base justify-end font-medium gap-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="text-teal-600 w-[169px] font-bold px-5 py-2 cursor-pointer rounded-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedPermissions.length === 0}
              className={`flex gap-1 font-bold  max-w-fit items-center justify-center text-white px-[14px] py-3 cursor-pointer rounded-sm ${isSubmitting || selectedPermissions.length === 0 ? 'bg-gray-400' : 'bg-[#136A86] hover:bg-[#5CB5BD]'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="text-white animate-spin" /> Saving...
                </>
              ) : mode === "assign" ? (
                "Assign Permissions"
              ) : (
                "Revoke Permissions"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
