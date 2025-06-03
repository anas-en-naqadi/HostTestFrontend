import { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { toast } from "sonner";
import { useUpdateProfile } from "../../lib/hooks/useUpdateProfile"; // Import the hook
import { useAuthStore } from "@/store/authStore";

interface UserResponse {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface ProfileModalProps {
  userId: number;
  fullName: string;
  onChangeFullName: (value: string) => void;
  passwordData: {
    current: string;
    newPass: string;
    confirm: string;
  };
  onChangePassword: {
    current: (v: string) => void;
    newPass: (v: string) => void;
    confirm: (v: string) => void;
  };
  onClose: () => void;
  onSubmitSuccess?: (updatedUser: UserResponse) => void;
}

export function EditProfileModal({
  userId,
  fullName,
  onChangeFullName,
  passwordData,
  onChangePassword,
  onClose,
  onSubmitSuccess,
}: ProfileModalProps) {
  // Create a local state for the full name that doesn't affect parent until submission
  const [localFullName, setLocalFullName] = useState(fullName);

  // Local state for password data
  const [localPasswordData, setLocalPasswordData] = useState({
    current: passwordData.current,
    newPass: passwordData.newPass,
    confirm: passwordData.confirm,
  });

  const [nameError, setNameError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const setAuth = useAuthStore((state) => state.setAuth);

  // Use the custom hook instead of local state for API operations
  const { updateProfile, isLoading, error: apiError } = useUpdateProfile();

  // Display API errors via toast
  useEffect(() => {
    if (apiError) {
      toast.error(`API Error: ${apiError}`, {
        position: "top-right",
      });
    }
  }, [apiError]);

  // Update local password validation when new password changes
  useEffect(() => {
    if (localPasswordData.newPass) {
      validatePassword(localPasswordData.newPass);
    }
  }, [localPasswordData.newPass]);

  // Validate input when form is touched
  useEffect(() => {
    if (formTouched || formSubmitted) {
      validateForm();
    }
  }, [localFullName, localPasswordData, formTouched, formSubmitted]);

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = (password: string) => {
    setPasswordRules({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  };

  const handleInputChange = () => {
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLocalPasswordData((prev) => ({ ...prev, newPass: value }));
    validatePassword(value);
    handleInputChange();
  };

  const validateForm = () => {
    let isValid = true;
    const hasChanges =
      localFullName !== fullName ||
      localPasswordData.current !== passwordData.current ||
      localPasswordData.newPass !== passwordData.newPass ||
      localPasswordData.confirm !== passwordData.confirm;

    // Check if form has any changes
    if (!hasChanges && formSubmitted) {
      toast.info("No changes to save", {
        position: "top-right",
      });
      return false;
    }

    // Validate fullName (always required)
    if (!localFullName.trim()) {
      setNameError("Full name is required");
      isValid = false;
    } else {
      setNameError(null);
    }

    // Only validate password fields if any of them contain data
    const newPasswordErrors = {
      current: "",
      newPass: "",
      confirm: "",
    };

    if (localPasswordData.newPass || localPasswordData.confirm) {
      // Current password is required if changing password
      if (!localPasswordData.current.trim()) {
        newPasswordErrors.current = "Current password is required";
        isValid = false;
      }

      // New password requirements
      if (localPasswordData.newPass) {
        if (
          !passwordRules.length ||
          !passwordRules.uppercase ||
          !passwordRules.lowercase ||
          !passwordRules.digit ||
          !passwordRules.specialChar
        ) {
          newPasswordErrors.newPass =
            "Password must meet all strength requirements";
          isValid = false;
        }
      } else {
        newPasswordErrors.newPass = "New password is required";
        isValid = false;
      }

      // Confirm password must match new password
      if (!localPasswordData.confirm) {
        newPasswordErrors.confirm = "Please confirm your password";
        isValid = false;
      } else if (localPasswordData.confirm !== localPasswordData.newPass) {
        newPasswordErrors.confirm =
          "Confirm password does not match the new password";
        isValid = false;
      }
    } else if (localPasswordData.current) {
      // Current password entered but no new password
      newPasswordErrors.newPass = "New password is required";
      isValid = false;
    }

    setPasswordErrors(newPasswordErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const isValid = validateForm();
    if (!isValid) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const payload: {
        full_name?: string;
        current_password?: string;
        new_password?: string;
        password_confirmation?: string;
      } = {};

      // Only include fields that have changes
      if (localFullName.trim() !== fullName) {
        payload.full_name = localFullName.trim();
      }

      if (localPasswordData.newPass) {
        payload.current_password = localPasswordData.current;
        payload.new_password = localPasswordData.newPass;
        payload.password_confirmation = localPasswordData.confirm;
      }

      // Check if payload is empty
      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const loadingToast = toast.loading("Saving changes...");

      const updatedUser = await updateProfile(userId, payload);

      // Only update parent state on successful API call
      if (updatedUser) {
        toast.dismiss(loadingToast);
        onChangeFullName(localFullName);
        onChangePassword.current("");
        onChangePassword.newPass("");
        onChangePassword.confirm("");

        if (onSubmitSuccess) {
          onSubmitSuccess(updatedUser);
        }

        // Get current auth state and token
        const currentAuth = useAuthStore.getState();
        const token = currentAuth.getToken();
        
        // Update auth store with the new user data while preserving the token
        if (token) {
          // Convert UserResponse to User type format
          const userForStore = {
            id: updatedUser.id,
            full_name: updatedUser.full_name,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            // Always ensure last_login is a string
            last_login: updatedUser.last_login 
              ? (typeof updatedUser.last_login === 'object' 
                ? updatedUser.last_login.toISOString() 
                : String(updatedUser.last_login))
              : (currentAuth.user?.last_login || ''),
            // Preserve email verification status
            email_verified: currentAuth.user?.email_verified ?? false
          };
          
          setAuth(token, userForStore);
        }
        onClose();
      }
    } catch (error: unknown) {
      console.error("Submit error:", error);
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
    }
  };

  // Handler for cancel button - discard local changes
  const handleCancel = () => {
    toast.info("Changes discarded");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-[839px]">
        <h2 className="text-xl font-semibold mb-4 text-[#136A86]">
          Edit Profile
        </h2>
        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700 text-sm">{apiError}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              value={localFullName}
              onChange={(e) => {
                setLocalFullName(e.target.value);
                handleInputChange();
              }}
              className={`focus-visible:ring-[#136A86] ${
                nameError ? "border-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {nameError && <p className="text-red-500 text-xs">{nameError}</p>}
          </div>

          <div className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                Current Password
                {localPasswordData.newPass || localPasswordData.confirm ? (
                  <span className="text-red-500">*</span>
                ) : null}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={localPasswordData.current}
                  onChange={(e) => {
                    setLocalPasswordData((prev) => ({
                      ...prev,
                      current: e.target.value,
                    }));
                    handleInputChange();
                  }}
                  className={`pr-10 focus-visible:ring-[#136A86] ${
                    passwordErrors.current ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                <Image
                  onClick={() => togglePassword("current")}
                  src={
                    showPasswords.current ? "/eye-show.svg" : "/eye-hidden.svg"
                  }
                  alt="Toggle password"
                  width={24}
                  height={24}
                  className="absolute right-3 top-4 cursor-pointer"
                />
              </div>
              {passwordErrors.current && (
                <p className="text-red-500 text-xs">{passwordErrors.current}</p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="newPassword">
                New Password
                {localPasswordData.current || localPasswordData.confirm ? (
                  <span className="text-red-500">*</span>
                ) : null}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.newPass ? "text" : "password"}
                  value={localPasswordData.newPass}
                  onChange={handleNewPasswordChange}
                  className={`pr-10 focus-visible:ring-[#136A86] ${
                    passwordErrors.newPass ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                <Image
                  onClick={() => togglePassword("newPass")}
                  src={
                    showPasswords.newPass ? "/eye-show.svg" : "/eye-hidden.svg"
                  }
                  alt="Toggle password"
                  width={24}
                  height={24}
                  className="absolute right-3 top-4 cursor-pointer"
                />
              </div>

              <div className="text-xs mt-2 space-y-1">
                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.length ? "text-[#71BF44]" : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.length ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={
                      !passwordRules.length ? "text-red-500" : "hidden"
                    }
                  />
                  At least 8 characters
                </p>
                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.uppercase ? "text-[#71BF44]" : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.uppercase ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={
                      !passwordRules.uppercase ? "text-red-500" : "hidden"
                    }
                  />
                  At least one uppercase letter
                </p>
                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.lowercase ? "text-[#71BF44]" : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.lowercase ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={
                      !passwordRules.lowercase ? "text-red-500" : "hidden"
                    }
                  />
                  At least one lowercase letter
                </p>
                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.digit ? "text-[#71BF44]" : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.digit ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={!passwordRules.digit ? "text-red-500" : "hidden"}
                  />
                  At least one digit
                </p>
                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.specialChar
                      ? "text-[#71BF44]"
                      : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.specialChar ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={
                      !passwordRules.specialChar ? "text-red-500" : "hidden"
                    }
                  />
                  At least one special character (@$!%*?&)
                </p>
              </div>
              {passwordErrors.newPass && (
                <p className="text-red-500 text-xs">{passwordErrors.newPass}</p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="confirmPassword">
                Confirm Password
                {localPasswordData.current || localPasswordData.newPass ? (
                  <span className="text-red-500">*</span>
                ) : null}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={localPasswordData.confirm}
                  onChange={(e) => {
                    setLocalPasswordData((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }));
                    handleInputChange();
                  }}
                  className={`pr-10 focus-visible:ring-[#136A86] ${
                    passwordErrors.confirm ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                <Image
                  onClick={() => togglePassword("confirm")}
                  src={
                    showPasswords.confirm ? "/eye-show.svg" : "/eye-hidden.svg"
                  }
                  alt="Toggle password"
                  width={24}
                  height={24}
                  className="absolute right-3 top-4 cursor-pointer"
                />
              </div>
              {passwordErrors.confirm && (
                <p className="text-red-500 text-xs">{passwordErrors.confirm}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              className="rounded-full px-5 cursor-pointer uppercase"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#136A86] text-white hover:opacity-90 rounded-full px-5 cursor-pointer uppercase"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
