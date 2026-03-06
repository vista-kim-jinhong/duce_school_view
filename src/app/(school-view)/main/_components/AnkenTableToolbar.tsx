"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  filterTextAtom,
  sortModeAtom,
  totalRowsAtom,
  isLoadingAtom,
  currentPageAtom,
  type SortMode,
} from "../_store";
import { FunnelIcon } from "@heroicons/react/24/outline";

// ソートモードの定義とボタン表示用の設定
const SORT_BUTTONS: {
  mode: SortMode;
  label: string;
  style: string;
}[] = [
  {
    mode: "order",
    label: "発注待ちを先頭にする",
    style: "bg-red-500 hover:bg-red-600 text-white",
  },
  {
    mode: "confirm",
    label: "完了確認待ちを先頭にする",
    style: "bg-green-600 hover:bg-green-700 text-white",
  },
];

/**
 * Client-Side-Component: Anken Table Toolbar
 * @description フィルタ入力、ソートモード切替、再読込機能を提供するツールバーコンポーネント
 * @returns JSX.Element
 */
export default function AnkenTableToolbar() {
  const router = useRouter();

  const filterText = useAtomValue(filterTextAtom);
  const setFilterText = useSetAtom(filterTextAtom);
  const sortMode = useAtomValue(sortModeAtom);
  const setSortMode = useSetAtom(sortModeAtom);
  const totalRows = useAtomValue(totalRowsAtom);
  const setCurrentPage = useSetAtom(currentPageAtom);
  const setIsLoading = useSetAtom(isLoadingAtom);

  // ソートモード切替 (同じボタンを押したらデフォルトに戻す)
  function handleSortMode(mode: SortMode) {
    setSortMode((prev) => (prev === mode ? "default" : mode));
    setCurrentPage(1);
  }

  // 再読込 (Server Component を再実行して Kintone データを再取得)
  function handleReload() {
    setIsLoading(true);
    setSortMode("default");
    setFilterText("");
    setCurrentPage(1);
    router.refresh();
  }

  return (
    <div className="mb-3 space-y-2">
      {/* 1行目: 案件一覧タイトル + 件数 + ソート・再読込ボタン */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-baseline gap-3">
          <h4 className="text-xl font-bold text-gray-800">案件一覧</h4>
          <span className="text-lg text-gray-500">全 {totalRows} 件</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {SORT_BUTTONS.map(({ mode, label, style }) => (
            <button
              key={mode}
              onClick={() => handleSortMode(mode)}
              className={[
                "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                style,
                sortMode === mode
                  ? "ring-2 ring-offset-1 ring-current opacity-90"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              ↺ {label}
            </button>
          ))}

          <button
            onClick={handleReload}
            className="rounded px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            ↺ 再読込
          </button>
        </div>
      </div>

      {/* 2行目: フィルタ入力 */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1">
          <label htmlFor="filter-input" className="text-sm text-gray-600 mr-1">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
          </label>
          <input
            id="filter-input"
            type="search"
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setCurrentPage(1);
            }}
            placeholder=""
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
          />
          <button
            onClick={() => {
              setFilterText("");
              setCurrentPage(1);
            }}
            disabled={!filterText}
            className="rounded px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            クリア
          </button>
        </div>
      </div>
    </div>
  );
}
