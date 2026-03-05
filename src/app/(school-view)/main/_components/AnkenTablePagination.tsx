"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { currentPageAtom, totalRowsAtom } from "../_store";
import { PER_PAGE } from "@/lib/constants/type";

/**
 * Client-Side-Component: AnkenTable Pagination
 * @description 案件一覧テーブルのページネーションコンポーネント。現在のページと総件数から表示するページ番号を計算し、ページ切り替えを行う。
 * @returns JSX.Element | null
 */
export default function AnkenTablePagination() {
  const currentPage = useAtomValue(currentPageAtom);
  const setCurrentPage = useSetAtom(currentPageAtom);
  const totalRows = useAtomValue(totalRowsAtom);

  const totalPages = Math.ceil(totalRows / PER_PAGE);

  if (totalPages <= 1) return null;

  // 表示するページ番号リストを生成
  // 現在ページの前後2ページ + 最初・最後を常に表示
  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      {/* 前へ */}
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="rounded px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ‹
      </button>

      {/* ページ番号 */}
      {pageNumbers.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 py-1.5 text-sm text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={[
              "rounded px-3 py-1.5 text-sm border transition-colors",
              page === currentPage
                ? "bg-gray-800 text-white border-gray-800"
                : "border-gray-300 hover:bg-gray-100 text-gray-700",
            ].join(" ")}
          >
            {page}
          </button>
        ),
      )}

      {/* 次へ */}
      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="rounded px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ›
      </button>
    </div>
  );
}
