"use client";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";

/**
 * Client Layout Header Component
 * @description ヘッダーコンポーネント
 * @returns JSX.Element
 */
export default function LayoutHeader() {
  const isLogin = true; // TODO: Cookie or Atomから取得
  const companyName = "VISTA ARTS"; // TODO: Atomから取得

  // TODO::ログアウト処理作成 | POST post/logout API叩く + Atomクリア Authクッキークリア

  return (
    <header className="sticky top-0 z-50 w-full bg-red-700/70 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="h-14 flex items-center justify-between px-6">
        {/* 左：サービス名（常に表示） */}
        <h1 className="text-lg font-semibold tracking-wide text-white">
          DUCE School View
        </h1>

        {/* 右：ログイン時のみ表示 */}
        {isLogin && (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end leading-tight">
              <span className="text-[10px] uppercase tracking-wider text-white/60">
                Current Space
              </span>
              <span className="text-sm font-medium text-white">
                {companyName}様
              </span>
            </div>

            <div className="h-6 w-px bg-white/20" />

            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition"
              onClick={() => {
                // TODO: atom clear + API logout
                location.href = "/login";
              }}
            >
              <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
