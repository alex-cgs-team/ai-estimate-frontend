import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps<T> {
  table: Table<T>;
}

export const Pagination = <T,>({ table }: PaginationProps<T>) => {
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();

  const getPages = () => {
    const pages: (number | string)[] = [];
    if (pageCount <= 5) {
      for (let i = 0; i < pageCount; i++) pages.push(i);
    } else {
      pages.push(0);
      if (pageIndex > 2) pages.push("...");

      const start = Math.max(1, pageIndex - 1);
      const end = Math.min(pageCount - 2, pageIndex + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (pageIndex < pageCount - 3) pages.push("...");
      pages.push(pageCount - 1);
    }
    return pages;
  };

  return (
    <div className="flex items-center px-4 gap-2 mt-10">
      <button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#ECE5EF] disabled:opacity-30 disabled:bg-[#F9F9F9] hover:bg-gray-50 transition-colors cursor-pointer group"
      >
        <ChevronLeft
          size={20}
          className="text-[#928D95] group-hover:text-[#A36FD1]"
        />
      </button>

      <div className="flex items-center gap-2">
        {getPages().map((page, index) => (
          <button
            key={index}
            disabled={page === "..."}
            onClick={() => typeof page === "number" && table.setPageIndex(page)}
            className={`w-10 h-10 rounded-xl border text-sm font-medium transition-all cursor-pointer
              ${
                page === "..."
                  ? "border-transparent cursor-default text-[#928D95]"
                  : ""
              }
              ${
                page === pageIndex
                  ? "border-[#A36FD1] text-[#0F0F0F] bg-white shadow-sm"
                  : "border-[#ECE5EF] text-[#928D95] hover:border-[#A36FD1] hover:text-[#A36FD1] bg-white"
              }
            `}
          >
            {typeof page === "number" ? page + 1 : page}
          </button>
        ))}
      </div>

      <button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#ECE5EF] disabled:opacity-30 disabled:bg-[#F9F9F9] hover:bg-gray-50 transition-colors cursor-pointer group"
      >
        <ChevronRight
          size={20}
          className="text-[#928D95] group-hover:text-[#A36FD1]"
        />
      </button>
    </div>
  );
};
