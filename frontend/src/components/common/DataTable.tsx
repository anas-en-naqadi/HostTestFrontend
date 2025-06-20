// src/components/ui/DataTable.tsx
"use client";

import { MRT_ColumnDef } from "material-react-table";
import { MaterialReactTable } from "material-react-table";
import { Box, IconButton, SxProps, Theme } from "@mui/material";
import { Trash2, Pencil } from "lucide-react";
import Spinner from "../common/spinner";
import AdminSpinner from "./AdminSpinnter";
import React from "react";
import { useMemo, useEffect, useState } from "react";
import { useSearchContext } from "@/contexts/SearchContext";

export interface ActionButton<T> {
  icon: React.ReactNode;
  onClick: (row: T, event?: React.MouseEvent<HTMLElement>) => void;
  color?: string;
  tooltip?: string;
  disableHover?: boolean;
  disabled?: boolean;
}

export interface DataTableProps<T> {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  isPending?: boolean;
  actionButtons?: ActionButton<T>[];
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  enableSearch?: boolean;
  muiTablePaperProps?: React.ComponentProps<
    typeof MaterialReactTable
  >["muiTablePaperProps"];
  muiTableProps?: React.ComponentProps<
    typeof MaterialReactTable
  >["muiTableProps"];
  muiTableBodyRowProps?: React.ComponentProps<
    typeof MaterialReactTable
  >["muiTableBodyRowProps"];
  muiTableHeadCellProps?: React.ComponentProps<
    typeof MaterialReactTable
  >["muiTableHeadCellProps"];
  muiTableBodyCellProps?: React.ComponentProps<
    typeof MaterialReactTable
  >["muiTableBodyCellProps"];
  muiPaginationProps?: React.ComponentProps<
    typeof MaterialReactTable
  >["muiPaginationProps"];
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  isPending = false,
  actionButtons = [],
  enableRowSelection = false,
  enablePagination = true,
  enableSearch = true,
  muiTablePaperProps,
  muiTableProps,
  muiTableBodyRowProps,
  muiTableHeadCellProps,
  muiTableBodyCellProps,
  muiPaginationProps,
}: DataTableProps<T>) {
  // Access the global search context
  const { globalSearchQuery, setGlobalSearchQuery } = useSearchContext();

  // State to hold the current search query for the table
  const [tableSearchQuery, setTableSearchQuery] = useState("");

  // Update table search when global search changes
  useEffect(() => {
    setTableSearchQuery(globalSearchQuery);
  }, [globalSearchQuery]);

  // Handle local search changes and sync with global search
  const handleSearchChange = (
    input: string | { target: { value: string } }
  ) => {
    let value: string;
    if (typeof input === "string") {
      value = input;
    } else if (
      input &&
      typeof input === "object" &&
      "target" in input &&
      typeof input.target.value === "string"
    ) {
      value = input.target.value;
    } else {
      value = "";
    }
    setTableSearchQuery(value);
    setGlobalSearchQuery(value); // Update the global search context
  };
  // Add actions column if action buttons are provided
  const tableColumns = useMemo(() => {
    if (actionButtons.length === 0) return columns;

    const actionsColumn: MRT_ColumnDef<T> = {
      id: "actions",
      header: "",
      Cell: ({ row }) => (
        <Box
          sx={{ display: "flex", gap: 1, justifyContent: "end" }}
          className="flex flex-wrap gap-1 items-center justify-end sm:flex-row flex-col"
        >
          {actionButtons.map((button, index) => (
            <div key={index} onClick={(e) => e.stopPropagation()}>
              {React.cloneElement(button.icon as React.ReactElement, {
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  button.onClick(row.original, e);
                },
              })}
            </div>
          ))}
        </Box>
      ),
    };

    return [...columns, actionsColumn];
  }, [columns, actionButtons]);

  if (isLoading) return <AdminSpinner />;
  if (isPending) return <Spinner />;

  return (
    <MaterialReactTable
      columns={tableColumns}
      data={data}
      enableColumnResizing={false}
      enableColumnFilters={true}
      enableDensityToggle={false}
      enableFullScreenToggle={false}
      enableHiding={true}
      enableColumnActions={false}
      enableTableHead={true}
      enableTopToolbar={enableSearch}
      enableBottomToolbar={enablePagination}
      enableRowSelection={enableRowSelection}
      enableGlobalFilter={enableSearch}
      globalFilterFn="contains"
      onGlobalFilterChange={handleSearchChange} // Use our custom handler to sync with global context
      state={{
        globalFilter: tableSearchQuery, // Use the tableSearchQuery from context
      }}
      muiSearchTextFieldProps={{
        placeholder: "Search...",
        variant: "outlined",
        size: "small",
        autoFocus: false, // Prevent auto-focus to avoid conflicts with AdminPageHeader search
        sx: {
          width: "300px",
          marginLeft: "0",
        },
      }}
      initialState={{
        showGlobalFilter: true, // Always show the global filter for better UX
      }}
      muiTopToolbarProps={{
        sx: {
          display: "flex",
          alignItems: "center",
          paddingLeft: "0",
          paddingRight: "0",
          paddingBottom: "1rem",
        },
      }}
      muiTablePaperProps={{
        sx: {
          overflowX: "auto",
          maxWidth: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          paddingLeft: { xs: "8px", md: "3rem" },
          paddingRight: { xs: "8px", md: "3rem" },
          paddingBottom: { xs: "1rem", md: "1.5rem" },
        },
      }}
      muiTableBodyRowProps={{
        hover: false,
        sx: {
          "&:nth-of-type(odd)": {
            backgroundColor: "#ffffff",
          },
          "&:nth-of-type(even)": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
          },
        },
      }}
      muiTableHeadCellProps={{
        sx: {
          fontSize: { xs: "14px", md: "16px" },
          fontWeight: 700,
          color: "#136A86",
          backgroundColor: "#FFFFFF",
          paddingBottom: "0.5rem",
          borderBottom: "none",
          paddingLeft: 0,
          textAlign: "left",
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
      }}
      muiTableBodyCellProps={({ row, table }) => ({
        sx: {
          fontSize: { xs: "13px", md: "15px" },
          paddingLeft: 0,
          paddingRight: 0,
          textAlign: "left",
          whiteSpace: "normal",
          wordBreak: "break-word",
          borderBottom:
            row.index === table.getRowModel().rows.length - 1
              ? "none"
              : "0.5px solid #136A86",
        },
      })}
      muiTableProps={{
        sx: {
          tableLayout: "auto",
          "& .MuiTableCell-root": {
            borderColor: "#136A86",
          },
          ...muiTableProps?.sx,
        },
        ...muiTableProps,
      }}
      muiBottomToolbarProps={{
        sx: {
          paddingTop: "25px",
          paddingBottom: "25px",
          "& .MuiToolbar-root": {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            padding: "0",
          },
          "& .MuiTablePagination-root": {
            display: "flex",
            justifyContent: "center",
            width: "100%",
          },
          "& .MuiTablePagination-actions": {
            marginLeft: "0",
          },
          "& .MuiInputBase-root": {
            color: "#136A86",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input": {
            marginRight: "8px",
            marginLeft: "8px",
            color: "#136A86",
          },
          "& .MuiTablePagination-displayedRows": {
            margin: "0 20px",
            color: "#136A86",
          },
        },
      }}
      paginationDisplayMode={enablePagination ? "pages" : "default"}
      positionPagination="bottom"
      muiPaginationProps={{
        hidePrevButton: true,
        hideNextButton: true,
        showFirstButton: false,
        showLastButton: false,
        shape: "rounded",
        size: "medium",
        sx: {
          display: "flex",
          justifyContent: "center",
          "& .MuiPaginationItem-root": {
            margin: "0 4px",
            color: "#136A86",
            borderColor: "#136A86",
            // Ensure outline buttons have the correct color
            "&.MuiPaginationItem-outlined": {
              border: "1px solid #136A86",
            },
            // Ensure text buttons have the correct color
            "&.MuiPaginationItem-text": {
              color: "#136A86",
            },
          },
          "& .Mui-selected": {
            backgroundColor: "#136A86 !important",
            color: "white !important",
            "&:hover": {
              backgroundColor: "#5CB5BD !important",
            },
          },
          "& .MuiPaginationItem-page:hover": {
            backgroundColor: "rgba(19, 106, 134, 0.1)",
          },
          ...muiPaginationProps?.sx,
        },
        ...muiPaginationProps,
      }}
    />
  );
}

export default DataTable;
