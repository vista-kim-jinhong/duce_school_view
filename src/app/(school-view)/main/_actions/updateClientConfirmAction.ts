"use server";

import { getSessionCookie } from "@/lib/cookie/session";
import { updateClientConfirmApi } from "@/lib/api/usecase/updateClientConfirmApi";

export interface UpdateClientConfirmActionResult {
  success: boolean;
  error?: string;
}

/**
 * クライアント確認処理を行うサーバーアクション
 * @param actionIds - 対応明細レコードIDリスト
 * @param ankenId - 案件レコードID
 */
export async function updateClientConfirmAction(
  actionIds: string[],
  ankenId: string,
): Promise<UpdateClientConfirmActionResult> {
  try {
    const session = await getSessionCookie();
    if (!session) {
      return {
        success: false,
        error: "セッションが切れています。再ログインしてください。",
      };
    }

    // API呼び出し
    await updateClientConfirmApi({ actionIds, ankenId });

    return { success: true };
  } catch (err) {
    console.error("[updateClientConfirmAction] エラー:", err);
    return {
      success: false,
      error: "処理に失敗しました。しばらく経ってから再試行してください。",
    };
  }
}
