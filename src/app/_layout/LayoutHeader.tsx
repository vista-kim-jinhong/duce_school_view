"use client";

import { useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { isLoginAtom, userInfoAtom, isLoadingAtom } from "../store/globalAtoms";
import { logoutAction } from "./_actions/logoutAction";
import { PATH } from "@/lib/constants/path";
import AppLoading from "@/components/ui/AppLoading/AppLoading";
import Image from "next/image";

/**
 * Client Layout Header Component
 * @description ヘッダーコンポーネント
 * @returns JSX.Element
 */
export default function LayoutHeader() {
  const router = useRouter();
  const [, setUserInfo] = useAtom(userInfoAtom);
  const isLogin = useAtomValue(isLoginAtom);
  const userInfo = useAtomValue(userInfoAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);

  // ログアウト処理
  // ログアウトアクションを呼び出し、ユーザー情報をクリアしてログインページへリダイレクト
  const handleLogout = async () => {
    setIsLoading(true);
    await logoutAction();
    setUserInfo(null);
    router.push(PATH.LOGIN);
  };

  return (
    <>
      {/* ローディング表示 */}
      {isLoading && <AppLoading variant="overlay" label="ログアウト中..." />}

      {/* ヘッダー */}
      <header className="sticky top-0 z-50 w-full bg-red-700/70 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="h-14 flex items-center justify-between px-6">
          {/* 左：サービス名（常に表示） */}
          <div className="flex items-center gap-4">
            <Image
              src="/duce_logo.png"
              alt="Duce Logo"
              height={32}
              width={120}
              className="object-contain"
            />
            <h1 className="text-lg font-semibold tracking-wide text-white">
              学校ビュー
            </h1>
          </div>

          {/* 右：ログイン時のみ表示 */}
          {isLogin && (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[10px] uppercase tracking-wider text-white/60">
                  Current Space
                </span>
                <span className="text-sm font-medium text-white">
                  {userInfo?.schoolOrCompanyName}様
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
