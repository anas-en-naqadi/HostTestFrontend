"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Guard against invalid inputs
  if (totalPages <= 0) return null;
  
  // Ensure current page is within valid range
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  
  // Generate page numbers for display exactly like in MyLearningPage
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // If total pages are 7 or fewer, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      if (validCurrentPage <= 4) {
        // Near the start
        pageNumbers.push(2, 3, 4, 5);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        // Near the end
        pageNumbers.push("...");
        pageNumbers.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pageNumbers.push("...");
        pageNumbers.push(validCurrentPage - 1, validCurrentPage, validCurrentPage + 1);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex justify-center mt-6 w-full">
      <div className="flex flex-wrap gap-1 sm:gap-2">
        
        
        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => (
          <button
            key={index}
            onClick={() =>
              typeof pageNumber === "number" ? onPageChange(pageNumber) : null
            }
            disabled={pageNumber === "..."}
            className={`px-2 sm:px-3 py-1 rounded-md text-sm sm:text-base font-bold cursor-pointer ${
              pageNumber === validCurrentPage
                ? "bg-[#136A86] text-white hover:bg-black"
                : pageNumber === "..."
                  ? "bg-white text-[#136A86] cursor-default" 
                  : "bg-white text-[#136A86]"
            }`}
            aria-current={pageNumber === validCurrentPage ? "page" : undefined}
          >
            {pageNumber}
          </button>
        ))}
        
        
      </div>
    </div>
  );
}