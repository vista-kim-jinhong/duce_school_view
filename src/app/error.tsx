"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PATH } from "@/lib/constants/path";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

/**
 * Error Page Component
 * @description Next.js エラーバウンダリー
 */
export default function ErrorPage({
  error,
  reset,
  title = "エラーが発生しました",
  description = "予期せぬエラーが発生しました。しばらくしてから再度お試しください。",
}: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("[ErrorPage]", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-md text-center px-6">
        {/* エラーコード */}
        <p className="text-[80px] font-bold leading-none text-red-100 select-none">
          !
        </p>

        {/* タイトル */}
        <h1 className="mt-2 text-xl font-semibold text-gray-900">{title}</h1>

        {/* 説明 */}
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          {description}
        </p>

        {/* エラー詳細（開発環境のみ） */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded-md bg-gray-100 px-4 py-3 text-left">
            <p className="text-xs font-mono text-gray-600 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* アクション */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-700 text-white hover:bg-red-800 transition"
          >
            再試行
          </button>
          <button
            onClick={() => router.push(PATH.MAIN)}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            トップへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
