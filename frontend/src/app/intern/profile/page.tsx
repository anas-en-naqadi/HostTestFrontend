"use client";

import React, { useEffect, useState } from "react";
import { EditProfileModal } from "@/components/ui/EditProfileModal";
import Avatar from "react-avatar";
import { AiOutlineEdit } from "react-icons/ai";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import Spinner from "@/components/common/spinner";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

type User = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
  last_login: string;
};

export default function ProfilePage() {
  const authUser = useAuthStore((state) => state.user) as User | null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(authUser);
  const [passwordData, setPasswordData] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  useEffect(() => {
    if (authUser) {
      try {
        console.log("User data:", authUser); // Debug role
        setUser(authUser);
      } catch (error) {
        toast.error("Error loading user profile data");
      }
    } else {
      // Optional: Notify if no user is found
      toast.info("Please log in to view your profile.");
    }
  }, [authUser]);

  const handleProfileSuccess = (response: ApiResponse<User>) => {
    try {
      console.log("Updated user:", response); // Debug
     if(response.success){
      useAuthStore.getState().setUser(response.data);
      setUser(response.data);
      setPasswordData({ current: "", newPass: "", confirm: "" });
     }
      console.log("Updated user in store:", useAuthStore.getState().user);
      console.log("Updated user in state:", response.data);
      toast.success("Profile updated successfully!", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Error updating profile display");
      console.error("Error handling profile success:", error);
    }
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    // Reset password fields when modal is closed
    setPasswordData({ current: "", newPass: "", confirm: "" });
  };

  if (!authUser) {
    return <div className="w-full flex items-center justify-center h-full"><Spinner /></div>
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen mt-4 md:mt-10">
      <main className="flex-1 py-4 md:py-10">
        <div className="bg-white rounded-2xl p-4 md:p-8 lg:p-12 flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="flex flex-col items-center space-y-2 md:space-y-4">
            <div id="avatar">
              <Avatar
                name={user?.full_name}
                round
                className="font-lora font-semibold w-[137px] h-[137px] text-[55px] text-[#FFFFFF]"
              />
            </div>
            <div className="mt-2 text-lg md:text-xl font-semibold text-[#000000] uppercase">
              {user?.full_name}
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full mt-4 md:mt-0">
            <div>
              <label className="text-sm md:text-base text-black">Full name</label>
              <input
                type="text"
                value={user?.full_name || ""}
                readOnly
                className="w-full px-3 py-2 bg-[#F6F8FC] rounded-md border border-gray-200"
              />
            </div>
            <div>
              <label className="text-sm md:text-base text-black">Username</label>
              <input
                type="text"
                value={user?.username || ""}
                readOnly
                className="w-full px-3 py-2 bg-[#F6F8FC] rounded-md border border-gray-200 text-[#8C8FA5]"
              />
            </div>
            <div>
              <label className="text-sm md:text-base text-black">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full px-3 py-2 bg-[#F6F8FC] rounded-md border border-gray-200 text-[#8C8FA5]"
              />
            </div>
            <div>
              <label className="text-sm md:text-base text-black">Password</label>
              <input
                value="************"
                readOnly
                className="w-full px-3 py-2 bg-[#F6F8FC] rounded-md border border-gray-200 text-[#8C8FA5]"
              />
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="hover:bg-[#136A86] hover:text-white hover:border-none border text-black hover:opacity-90 rounded-full px-2 py-2 cursor-pointer uppercase flex items-center gap-2"
              >
                <AiOutlineEdit size={24} />
              </button>
            </div>
          </div>
        </div>

        {isEditModalOpen && (
          <EditProfileModal
            userId={authUser.id}
            fullName={user?.full_name}
            onChangeFullName={(value: string) =>
              setUser((prev) => ({ ...prev, full_name: value }))
            }
            passwordData={passwordData}
            onChangePassword={{
              current: (v: string) =>
                setPasswordData((prev) => ({ ...prev, current: v })),
              newPass: (v: string) =>
                setPasswordData((prev) => ({ ...prev, newPass: v })),
              confirm: (v: string) =>
                setPasswordData((prev) => ({ ...prev, confirm: v })),
            }}
            onClose={handleModalClose}
            onSubmitSuccess={handleProfileSuccess}
          />
        )}
      </main>
    </div>
  );
}