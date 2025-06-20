"use client";

import { Dialog, DialogContent } from "@mui/material";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  itemName,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "1rem",
          width: "100%",
        },
      }}
    >
      <DialogContent
        className="w-full sm:min-w-[400px] sm:max-w-[553px] px-4 py-8 flex flex-col items-center text-center"
      >
        <div className="bg-[#FFBEBE] rounded-full w-[50px] h-[50px] flex items-center justify-center mb-5">
          <Trash2 size={32} strokeWidth={2} color="#FF0000" />
        </div>

        <h2 className="mb-4 text-[22px] font-semibold text-black">
          Confirm Delete
        </h2>

        <p className="mb-[30px] text-black leading-[1.5] sm:text-xl text-base">
          Are you sure you want to delete this {itemName}? This action cannot be
          undone.
        </p>

        <div className="flex flex-row justify-center flex-wrap gap-[12px] w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="bg-transparent border-none text-[#8C8FA5] px-5 py-2.5 text-[16px] cursor-pointer rounded-[4px] font-medium flex-1 max-w-[170px]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="bg-[#FF0000] border-none text-white px-[30px] py-2.5 text-[16px] cursor-pointer rounded-[4px] font-medium flex-1 max-w-[170px]"
            disabled={isLoading}
          >
            {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Delete"
          )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
