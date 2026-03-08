"use server";

/**
 * =================================================
 * 学内用メモ保存 サーバーアクション
 * =================================================
 */

import { getSessionCookie } from "@/lib/cookie/session";
import { upsertMemoApi } from "@/lib/api/usecase/upsertMemoApi";

export interface UpsertMemoActionResult {
  success: boolean;
  /** 保存後の更新日時 (成功時) */
  updatedAt?: string;
  /** エラーメッセージ (失敗時) */
  error?: string;
}

/**
 * 学内用メモを保存するサーバーアクション
 * @param recordId - 案件レコードID
 * @param memo - 保存するメモ本文
 */
export async function upsertMemoAction(
  recordId: string,
  memo: string,
): Promise<UpsertMemoActionResult> {
  try {
    // セッションからloginIdを取得
    const session = await getSessionCookie();
    if (!session) {
      return {
        success: false,
        error: "セッションが切れています。再ログインしてください。",
      };
    }

    const { loginId } = session;

    const result = await upsertMemoApi({ recordId, memo, loginId });

    return { success: true, updatedAt: result.updatedAt };
  } catch (err) {
    console.error("[upsertMemoAction] エラー:", err);
    return {
      success: false,
      error: "保存に失敗しました。しばらく経ってから再試行してください。",
    };
  }
}
