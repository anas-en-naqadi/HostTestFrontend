"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/common/DataTable";
import { MRT_ColumnDef } from "material-react-table";
import ProgressBar from "@/components/ui/progress";
import Image from "next/image";
import { Download } from "lucide-react";
import { useFetchCertificates, FormattedCertificate } from "@/lib/hooks/useFetchCertificates";
import { downloadCertificate } from "@/lib/api/certificates";
import { toast } from "sonner";
import Spinner from "@/components/common/spinner";
import Link from "next/link";

export default function CertificatesPage() {
  // Fetch certificates using the custom hook
  const { data: certificates = [], isLoading, isError } = useFetchCertificates();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const columns = useMemo<MRT_ColumnDef<FormattedCertificate>[]>(
    () => [
      {
        accessorKey: "thumbnail_url",
        header: "",
        size: 50,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex items-center justify-center w-[62px] h-[35px]">
            <Image
              src={row.original.thumbnail_url}
              alt={row.original.title || "Course thumbnail"}
              width={62}
              height={35}
              className="object-cover rounded-md"
              loading="lazy"
              quality={75}
            />
          </div>
        ),
      },
      {
        accessorKey: "title",
        header: "Course Title",
        size: 350,
        Cell: ({ cell }) => (
          <span className="font-medium text-gray-800">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "progress",
        header: "Progress",
        size: 300,
        Cell: ({ row }) => (
          <div className="flex items-center gap-3 w-full max-w-[360px]">
            <div className="flex-1">
              <ProgressBar
                value={Number(row.original.progress) || 0}
                color={row.original.isCompleted ? "bg-green-700" : "custom-blue-bg"}
              />
            </div>

            <span className={`text-xs font-sans font-semibold ${row.original.isCompleted ? "text-green-700" : "custom-blue"
              }`}>
              {row.original.progress || 0}%
            </span>
          </div>
        ),
      },
      {
        id: "certificate_actions",
        header: "Certificate Action",
        size: 220,
        Cell: ({ row }) => {
          const handleDownload = async () => {
            if (!row.original.isCompleted) return;
            
            try {
              setDownloadingId(row.original.enrollmentId);
              const blob = await downloadCertificate(row.original.enrollmentId);
              
              // Create a download link and trigger download
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `${row.original.title.replace(/\s+/g, '-').toLowerCase()}-certificate.pdf`);
              document.body.appendChild(link);
              link.click();
              
              // Clean up
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success('Certificate downloaded successfully');
            } catch (error) {
              console.error('Error downloading certificate:', error);
              toast.error('Failed to download certificate');
            } finally {
              setDownloadingId(null);
            }
          };
          
          const isDownloading = downloadingId === row.original.enrollmentId;
          
          return (
            <div className="w-full mx-auto flex items-center justify-center">
              <button
                className={`p-1.5 rounded-full transition-colors ${row.original.isCompleted
                    ? "custom-blue hover:custom-blue-hover cursor-pointer"
                    : "bg-[#EDEDED80] text-[#D7D7D7] cursor-not-allowed"
                  }`}
                disabled={!row.original.isCompleted || isDownloading}
                onClick={handleDownload}
                title="Download Certificate"
              >
                <Download size={18} className={isDownloading ? "animate-pulse" : ""} />
              </button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    []
  );

  return (
    <div className="">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <p className="text-lg font-medium text-red-500">
            Error loading certificates
          </p>
          <p className="text-sm text-gray-500">
            Please try again later
          </p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-lg font-medium text-gray-400">
            No certificates found
          </p>
          <p className="text-sm text-gray-500">
            Complete courses to earn certificates
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={certificates}
          isLoading={isLoading}
          isPending={isLoading}
        />
      )}
    </div>
  );
}