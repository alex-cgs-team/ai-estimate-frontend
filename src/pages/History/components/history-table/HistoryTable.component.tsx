import { Loader } from "@/components";
import { useError, useEstimates } from "@/hooks";
import { ERRORS_TEXT, TABLE_TEXT, TEXT } from "@/shared/constants/text";
import type { Project } from "@/types/types";
import { showToast } from "@/utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyTable } from "../empty-table/EmptyTable.component";
import { Pagination } from "../pagination/Pagination.component";

const columnHelper = createColumnHelper<Project>();

const ITEMS_PER_PAGE = 10;

export const HistoryTable = () => {
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const { data = [], isLoading, isError } = useEstimates(sort);
  const { setToastErrorText } = useError();

  useEffect(() => {
    if (isError) {
      setToastErrorText(ERRORS_TEXT.something_went_wrong);
    }
  }, [isError]);

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast({ text: TEXT.copied, type: "success" });
      })
      .catch(() => {
        setToastErrorText(ERRORS_TEXT.something_went_wrong);
      });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("projectName", {
        header: () => (
          <div className="flex items-center gap-1 column-title">
            {TABLE_TEXT.project_name}
          </div>
        ),
        cell: (info) => (
          <div className="truncate pr-4" title={info.getValue()}>
            <span className="raw-text">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("dateAdded", {
        header: () => (
          <div className="flex items-center gap-1 column-title z-50">
            <span>{TABLE_TEXT.date_added}</span>{" "}
            <div>
              <div
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSort("asc")}
              >
                <ChevronUp
                  size={14}
                  color={sort === "asc" ? "#0F0F0F" : "#D0D5DD"}
                />
              </div>
              <div
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => setSort("desc")}
              >
                <ChevronDown
                  size={14}
                  color={sort === "desc" ? "#0F0F0F" : "#D0D5DD"}
                />
              </div>
            </div>
          </div>
        ),
        cell: (info) => <span className="raw-text">{info.getValue()}</span>,
      }),
      columnHelper.accessor("noteToAi", {
        header: () => (
          <div className="flex items-center gap-1 column-title">
            {TABLE_TEXT.note_to_ai}
          </div>
        ),
        cell: (info) => (
          <div className="flex items-center gap-2 group w-full">
            <span className="raw-text truncate" title={info.getValue()}>
              {info.getValue()}
            </span>
            {info.getValue() !== "No notes" && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer"
                onClick={() => handleCopy(info.getValue())}
              >
                <Copy size={16} color="#928D95" />
              </button>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("link", {
        header: () => (
          <div className="flex items-center justify-end gap-1 column-title w-full pr-22">
            <span>{TABLE_TEXT.link}</span>
          </div>
        ),
        cell: (info) => (
          <div className="text-right w-full">
            <a
              href={info.getValue()}
              target="_blank"
              className="raw-text text-[#A36FD1] underline-offset-4 hover:underline whitespace-nowrap"
            >
              {TABLE_TEXT.go_to_estimate}
            </a>
          </div>
        ),
      }),
    ],
    [sort]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: ITEMS_PER_PAGE,
      },
    },
  });

  const isNotEmpty = data.length > 0;

  if (isLoading || isError) {
    return (
      <div className="w-full h-[300px] flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-gray-900">
        {TEXT.history}
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-t border-[#ECE5EF]"
              >
                {headerGroup.headers.map((header) => {
                  let widthClass = "w-auto";
                  if (header.id === "projectName") widthClass = "w-[20%]";
                  if (header.id === "dateAdded") widthClass = "w-[15%]";
                  if (header.id === "noteToAi") widthClass = "w-[50%]";
                  if (header.id === "link") widthClass = "w-[15%]";

                  return (
                    <th
                      key={header.id}
                      className={`text-left py-3 px-4 text-sm font-medium text-gray-500 ${widthClass}`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody
            className={`divide-y divide-[#ECE5EF] ${
              isNotEmpty ? "border-b" : ""
            } border-[#ECE5EF]`}
          >
            {isNotEmpty ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="py-4 px-4 table-raw-text overflow-hidden"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-[60vh] align-middle">
                  <EmptyTable />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {isNotEmpty && <Pagination table={table} />}
      </div>
    </div>
  );
};
