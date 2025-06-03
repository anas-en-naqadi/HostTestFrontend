// src/components/ui/CategoryModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Category } from "./CategoriesTable";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (category: Omit<Category, "id">) => void;
  initialData: Category | null;
  isLoading: boolean;
}

export default function CategoryModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [courseCount, setCourseCount] = useState<number>(0);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialData?.name || "");
      setCourseCount(initialData?.courseCount || 0);
      setNameError("");
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError("Category name is required");
      return;
    }

    onSubmit({
      name: name.trim(),
      courseCount: courseCount,
    });

    setName("");
    setCourseCount(0);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "1rem",
        },
        className: "md:min-w-[694px]",
      }}
    >
      <DialogTitle
        sx={{
          color: "#136A86",
          fontWeight: 600,
          fontSize: "1.5rem",
        }}
      >
        {initialData ? "Edit Category" : "Add Category"}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="md:min-w-[400px]">
          <TextField
            autoFocus
            margin="dense"
            label={
              <span>
                Category Name{" "}
                <span style={{ color: "red", fontSize: "14px" }}>*</span>
              </span>
            }
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            error={!!nameError}
            helperText={nameError}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "#136A86",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#136A86",
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ padding: "0 24px 20px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#136A86",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
              marginRight: "10px",
            }}
            className="font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: "#136A86",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 24px",
              width: "169px",
              fontWeight: "500",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="text-[12px] sm:text-[16px] font-semibold"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : initialData ? (
              "Save Changes"
            ) : (
              "Add Category"
            )}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
