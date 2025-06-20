"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ApiRole, CreateRoleDto, UpdateRoleDto } from "@/types/role.types";
import { useCreateRole } from "@/lib/hooks/role-management/useCreateRole";
import { useUpdateRole } from "@/lib/hooks/role-management/useUpdateRole";
import { alertSuccess } from "@/utils/alert";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface RoleModalProps {
  open: boolean;
  onClose: () => void;
  role?: ApiRole;
  title: string;
}

const roleSchema = z.object({
  name: z.string().min(2, { message: "Role name must be at least 2 characters" }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof roleSchema>;

export function RoleModal({ open, onClose, role, title }: RoleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  
  const queryClient = useQueryClient();
  const { mutateAsync: createRole } = useCreateRole();
  const { mutateAsync: updateRole } = useUpdateRole();

  const isNewRole = !role || !role.id;

  // Initialize form when the modal opens or role prop changes
  useEffect(() => {
    if (open) {
      if (role) {
        setForm({
          name: role.name || "",
          description: role.description || "",
        });
      } else {
        // Reset form for new role
        setForm({
          name: "",
          description: "",
        });
      }
    }
  }, [open, role]);

  // Handle form field changes
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!form.name || form.name.trim().length < 2) {
      toast.error("Role name must be at least 2 characters");
      return false;
    }
    return true;
  };

  // Reset form and state when modal closes
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (role?.id) {
        // Update existing role
        const updateData: UpdateRoleDto = {
          name: form.name,
          description: form.description,
        };
        
        // Step 1: Update the role
        const response = await updateRole({ id: role.id, data: updateData });
        
        // Step 2: Show success message
        alertSuccess("Success", response.message);
        
        // Step 3: Close the modal
        onClose();
        
        // Step 4: Manually invalidate the query instead of refetching
        // This prevents infinite refetching loops
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['roles'] });
        }, 100);
      } else {
        // Create new role
        const createData: CreateRoleDto = {
          name: form.name,
          description: form.description,
        };
        
        // Step 1: Create the role
        const response = await createRole(createData);
        
        // Step 2: Show success message
        alertSuccess("Success", response.message);
        
        // Step 3: Close the modal
        onClose();
        
        // Step 4: Manually invalidate the query instead of refetching
        // This prevents infinite refetching loops
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['roles'] });
        }, 100);
      }
    } catch (error) {
      console.error("Error submitting role:", error);
      toast.error(typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : 'Failed to save role. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" className="font-sans">
      <DialogTitle>
            <Typography variant="h6" component="span" className="text-[#136A86] text-xl" fontWeight={700} >
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5 px-6">
          {/* Role Name */}
          <div>
            <label className="font-medium text-base block text-gray-700 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-medium text-base block text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows={4}
            ></textarea>
          </div>

          {/* Permissions section could be added here in the future */}
          
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
              className="bg-[#136A86] flex gap-1 font-bold w-[169px] items-center justify-center text-white px-[14px] py-3 cursor-pointer hover:bg-[#5CB5BD] rounded-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="text-white animate-spin" /> Saving...
                </>
              ) : role?.id ? (
                "Save changes"
              ) : (
                "Add Role"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
