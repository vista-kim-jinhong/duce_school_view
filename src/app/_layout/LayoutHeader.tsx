"use client";

import { useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { isLoginAtom, sessionAtom } from "../store/globalAtoms";
import { logoutAction } from "./_actions/logoutAction";
import { PATH } from "@/lib/constants/path";
import { useState } from "react";
import AppLoading from "@/components/ui/AppLoading/AppLoading";

/**
 * Client Layout Header Component
 * @description ヘッダーコンポーネント
 * @returns JSX.Element
 */
export default function LayoutHeader() {
  const router = useRouter();
  const [, setSession] = useAtom(sessionAtom);
  const isLogin = useAtomValue(isLoginAtom);
  const session = useAtomValue(sessionAtom);
  const [loading, setLoading] = useState(false);

  // ログアウト処理
  const handleLogout = async () => {
    setLoading(true);
    await logoutAction();
    setSession(null);
    router.push(PATH.LOGIN);
    setLoading(false);
  };

  return (
    <>
      {/* ローディング表示 */}
      {loading && <AppLoading variant="overlay" label="ログアウト中..." />}

      {/* ヘッダー */}
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
                  {session?.schoolOrCompanyName}様
                </span>
              </div>

              <div className="h-6 w-px bg-white/20" />

              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition"
                onClick={handleLogout}
              >
                <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
