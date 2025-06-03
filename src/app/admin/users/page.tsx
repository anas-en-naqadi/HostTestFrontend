"use client"
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import UsersTable from "@/components/ui/UsersTable";
import { UserModal } from "@/components/ui/UserModal";
import { useState } from "react";
import { ApiUser } from "@/types/user.types";

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | undefined>(undefined);
  
  const handleOpenModal = (user?: ApiUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Clear the selected user after a small delay to prevent UI flickering
    setTimeout(() => setSelectedUser(undefined), 300);
  };

  return (
    <div className="w-full overflow-hidden">
      <AdminPageHeader  
        title="Users"
        showAddButton={true}
        addButtonText="Add User"
        onAddClick={() => handleOpenModal()}
        searchPlaceholder="Search users"
      />
      <UsersTable 
        onEditUser={handleOpenModal}
      />
      <UserModal
        open={isModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        title={`${selectedUser?.id ? "Edit User's Personal Information" : "Add New User"}`}
      />
    </div>
  );
}