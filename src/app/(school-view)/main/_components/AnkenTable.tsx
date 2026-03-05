"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAtomValue } from "jotai";
import { pagedAnkenListAtom } from "../_store";
import { useAnkenColumns } from "./table/useAnkenColumns";
import type { EnrichedAnkenRecord } from "@/lib/api/types/kintone";

function getRowClassName(row: EnrichedAnkenRecord): string {
  if (row.ステータス.value === "【検収済】") return "bg-green-50";
  if (row.ユーザー_緊急度.value === "緊急") return "bg-red-100";
  return "";
}

/**
 * Client-Side-Component: Anken Table
 * @description TanStack Tableを使用して案件一覧を表示するテーブルコンポーネント
 * @returns JSX.Element
 */
export default function AnkenTable() {
  const data = useAtomValue(pagedAnkenListAtom);
  const columns = useAnkenColumns();

  // TanStack Tableのセットアップ
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="w-full text-sm">
        {/* ヘッダー */}
        <thead className="bg-gray-800 text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-center font-medium whitespace-nowrap"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
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
