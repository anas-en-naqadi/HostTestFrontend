"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, Typography } from "@mui/material";
import { ApiUser } from "@/types/user.types";
import { CustomSwitch } from "./CustomSwitch";
import { useStoreUser } from "@/lib/hooks/user-management/useStoreUser";
import { useUpdateUser } from "@/lib/hooks/user-management/useUpdateUser";
import { Loader2 } from "lucide-react";
import {  alertSuccess } from "@/utils/alert";
import { toast } from "sonner";
import RichTextEditor from "../features/RichInput";

export interface RoleOption {
  id: number | string;
  name: string;
}

export interface UserModalProps {
  open: boolean;
  title?: string;
  user?: ApiUser;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  open,
  title = "Edit User's Personal Information",
  user,
  onClose,
}) => {
  const [form, setForm] = useState<ApiUser>({
    full_name: "",
    username: "",
    role: "",
    email: "",
    status: false,
  });
    const isNewUser = !user || Object.keys(user).length === 0 || !user.id;

  const { mutateAsync: storeUser } = useStoreUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const [isLoading, setIsLoading] = useState(false);

  const roles = ["admin", "intern", "instructor"];
const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
  // Initialize form when the modal opens or user prop changes
  useEffect(() => {
    if (open) {
      if (user) {
        setForm({
          full_name: user.full_name || "",
          username: user.username || "",
          email: user.email || "",
          role: user.role || "",
          status: user.status === "active" ? true : false,
          description: user.description || "",
          specialization: user.specialization || "",
        });
      } else {
        // Reset form for new user
        setForm({
          full_name: "",
          username: "",
          role: "",
          email: "",
          status: true,
          description: "",
          specialization: "",
        });
      }
    }
  }, [open, user]);
 const handleGenerateUsername = (full_name:string) => {
      const newUsername = generateUsername(full_name);
      setForm(prev => ({ ...prev, username: newUsername }));
  }
  // Handle form field changes
  const handleChange = <K extends keyof ApiUser>(key: K, value: ApiUser[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if(key === "full_name") handleGenerateUsername(value);
    console.log(form)
  };

  // Handle role change
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange("role", e.target.value);
  };

  // Handle status change specifically for the CustomSwitch component
  const handleStatusChange = (checked: boolean) => {
    handleChange("status", checked);
  };
// Create a function to prepare the form data before submission
const prepareFormData = () => {
  // Create a copy of the form data
  const formData = { ...form };
  
  // If the role is not instructor, remove instructor-specific fields
  if (formData.role === "intern") {
    delete formData.description;
    delete formData.specialization;
  }
  
  return formData;
};
  const handleSave = () => {
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    
    storeUser(prepareFormData())
      .then((res) => {
        alertSuccess("Success", res.message);
        onClose();
      })
      .catch((error) => {
        if(error && error.response.status === 409)
        toast.error(error.response.data.message);
        else
          toast.error("An error occurred while saving the user.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const checkAction = (e: React.FormEvent) => {
    // Prevent form submission if already loading
    if(isLoading) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
      if (!isValidEmail(form.email)) {
    toast.error("Please enter a valid email address.");
    return;
  }
   if (user?.id) {
      handleUpdate();
    } else {
      handleSave();
    }
  };

  const handleUpdate = () => {
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    
    updateUser({ userId: user!.id!, body: prepareFormData() })
      .then((res) => {
        alertSuccess("Success", res.message);
        onClose();
      })
      .catch((error) => {
        console.error("Error updating user:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const generateUsername = (fullName: string) => {
    if (!fullName) return "";
    
    // Replace spaces and hyphens with underscores, remove all other special characters except letters, numbers, underscores, and @
    const cleanedName = fullName
      .toLowerCase()
      .replace(/[\s\-]+/g, '_') // Replace spaces and hyphens with underscores
      .replace(/[^a-z0-9_@]/g, ''); // Remove any character that's not a letter, number, underscore, or @
    
    const baseUsername = '@' + cleanedName;
    
    // Add random 3-digit number for uniqueness
    const randomNum = Math.floor(Math.random() * 900) + 100; // Random number between 100-999
    
    return `${baseUsername}${randomNum}`;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" className="font-sans">
      <DialogTitle>
        <Typography variant="h6" component="div" className="text-[#136A86] font-bold text-xl" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={checkAction} className="space-y-5 px-6">
          {/* Full Name */}
          <div>
            <label className="font-medium text-base block text-gray-700 mb-1">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Username and Email fields - always show for new users */}

          {isNewUser && (
            <>
              <div>
                <label className="font-medium text-base block text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.username || ""}
                  onChange={(e) => handleChange("username", e.target.value)}
                  disabled={true} // Disable for existing users
                  required
                  className={`w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-100`}
                />
              </div>
              <div>
                <label className="font-medium text-base block text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </>
          )}

          {/* Role and Account State - 2 column layout */}
          <div className="flex justify-between gap-6">
            {/* Role Dropdown */}
            <div className="flex-1">
              <label className="font-medium text-base block text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.role || ""}
                  required
                  onChange={handleRoleChange}
                  className="w-full border border-gray-300 rounded p-2 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">Select a Role</option>
                  {roles.map((r, index) => (
                    <option key={index} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Account State Toggle */}
            <div>
              <label className="font-medium text-base block text-gray-700 mb-1">
                Account State <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center font-normal text-base text-[#8C8FA5] gap-3 justify-center border border-gray-300 rounded p-2">
                <span className="">Inactive</span>
                <CustomSwitch
                  checked={Boolean(form.status)}
                  onChange={(_, checked: boolean) =>
                    handleStatusChange(checked)
                  }
                />
                <span className="">Active</span>
              </div>
            </div>
          </div>

          {/* Conditional fields for instructor role */}
          {(form.role === "admin" || form.role === "instructor") && (
            <>
              {/* Specialization */}
              <div>
                <label className="font-medium text-base block text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={form.specialization || ""}
                  onChange={(e) =>
                    handleChange("specialization", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-medium text-base block text-gray-700 mb-1">
                  Description
                </label>
                   <RichTextEditor
                        initialValue={form.description}
                        maxHeight="85px"
                        maxWidth="max-w-full"
                        onChange={(value) => handleChange("description", value)}
                        placeholder="Enter instructor description..."
                        maxChars={5000}
                      />
              </div>
            </>
          )}

          <div className="flex text-sm justify-end font-medium gap-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="text-teal-600 px-5 py-2 cursor-pointer rounded-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-[#136A86] flex gap-1 font-bold items-center justify-center text-white px-[14px] py-3  hover:bg-[#5CB5BD] rounded-sm ${isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="text-white animate-spin" /> Saving...
                </>
              ) : user?.id ? (
                "Save changes"
              ) : (
                "Add User"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
