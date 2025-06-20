"use client"
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import RolesTable from "@/components/ui/RolesTable";
import { RoleModal } from "@/components/ui/RoleModal";
import { useState } from "react";
import { ApiRole } from "@/types/role.types";

export default function RolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ApiRole | undefined>(undefined);
  
  const handleOpenModal = (role?: ApiRole) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Clear the selected role after a small delay to prevent UI flickering
    setTimeout(() => setSelectedRole(undefined), 300);
  };

  return (
    <div className="w-full overflow-hidden">
      <AdminPageHeader  
        title="Roles"
        showAddButton={true}
        addButtonText="Add Role"
        onAddClick={() => handleOpenModal()}
        searchPlaceholder="Search roles"
      />
      <RolesTable 
        onEditRole={handleOpenModal}
      />
      <RoleModal
        open={isModalOpen}
        onClose={handleCloseModal}
        role={selectedRole}
        title={`${selectedRole?.id ? "Edit Role" : "Add New Role"}`}
      />
    </div>
  );
}