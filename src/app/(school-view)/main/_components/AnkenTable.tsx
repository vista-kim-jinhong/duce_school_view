"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { useAtomValue } from "jotai";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { pagedAnkenListAtom } from "../_store";
import { useAnkenColumns } from "./table/useAnkenColumns";
import type { EnrichedAnkenRecord } from "@/lib/api/types/kintone";

// ソート可能なカラムID
const SORTABLE_COLUMNS = new Set([
  "PROJECT_NUMBER",
  "RECEPTION_NUMBER",
  "BUILDING_NAME",
  "CONSTRUCTION_NAME",
  "DUCE_MANAGER",
  "STATUS",
  "COMPLETION_CHECK",
  "INSPECTION_DATE",
]);

/**
 * Client-Side-Component: Anken Table
 * @description TanStack Tableを使用して案件一覧を表示するテーブルコンポーネント
 * @returns JSX.Element
 */
export default function AnkenTable() {
  const data = useAtomValue(pagedAnkenListAtom);
  const columns = useAnkenColumns();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="w-full text-sm">
        {/* ヘッダー */}
        <thead className="bg-gray-800 text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSortable = SORTABLE_COLUMNS.has(header.column.id);
                const sortDir = header.column.getIsSorted();

                return (
                  <th
                    key={header.id}
                    className={[
                      "px-3 py-2 text-center font-medium whitespace-nowrap",
                      isSortable
                        ? "cursor-pointer select-none hover:bg-gray-700 transition-colors"
                        : "",
                    ].join(" ")}
                    onClick={
                      isSortable
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <span className="inline-flex items-center justify-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {isSortable && (
                        <span className="text-gray-400">
                          {sortDir === "asc" ? (
                            <ChevronUpIcon className="h-3 w-3 text-white" />
                          ) : sortDir === "desc" ? (
                            <ChevronDownIcon className="h-3 w-3 text-white" />
                          ) : (
                            <ChevronUpDownIcon className="h-3 w-3 text-gray-500" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        {/* ボディ */}
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-gray-400"
              >
                データがありません
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={[
                  getRowClassName(row.original),
                  i % 2 !== 0 ? "bg-gray-50" : "",
                  "hover:brightness-95 transition-all",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-2 border-t border-gray-100"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 行の背景色をステータスや緊急度に応じて変える
 * @param row
 * @returns
 */
function getRowClassName(row: EnrichedAnkenRecord): string {
  if (row.ステータス.value === "【検収済】") return "bg-green-100";
  if (row.ユーザー_緊急度.value === "緊急") return "bg-red-100";
  return "";
}
