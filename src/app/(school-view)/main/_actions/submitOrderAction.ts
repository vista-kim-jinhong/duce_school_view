"use server";

import { getSessionCookie } from "@/lib/cookie/session";
import { sendOrderApi } from "@/lib/api/usecase/sendOrderApi";
import { updateOrderApi } from "@/lib/api/usecase/updateOrderApi";

export interface SubmitOrderActionResult {
  success: boolean;
  /** 発注日 (atom更新用) */
  orderDate?: string;
  error?: string;
}

export interface SubmitOrderParams {
  /** 案件レコードID */
  ankenId: string;
  /** 受付番号 */
  uketsukeNo: string;
  /** ご発注者名 */
  name: string;
  /** ご担当者メールアドレス */
  mail: string;
  /** CC1 */
  cc1: string;
  /** CC2 */
  cc2: string;
  /** 備考 */
  remarks: string;
}

/**
 * 発注確定サーバーアクション
 * @description 発注メール送信とkintone更新を並列実行する
 *              どちらかが失敗した場合はエラーを返す
 */
export async function submitOrderAction(
  params: SubmitOrderParams,
): Promise<SubmitOrderActionResult> {
  try {
    const session = await getSessionCookie();
    if (!session) {
      return {
        success: false,
        error: "セッションが切れています。再ログインしてください。",
      };
    }

    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const orderDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    // 発注メール送信 + kintone更新を並列実行
    await Promise.all([
      sendOrderApi({
        uketsukeNo: params.uketsukeNo,
        clientName: session.schoolOrCompanyName,
        name: params.name,
        mail: params.mail,
        cc1: params.cc1,
        cc2: params.cc2,
        remarks: params.remarks,
      }),
      updateOrderApi({
        ankenId: params.ankenId,
        name: params.name,
        mail: params.mail,
        cc1: params.cc1,
        cc2: params.cc2,
        remarks: params.remarks,
      }),
    ]);

    return { success: true, orderDate };
  } catch (err) {
    console.error("[submitOrderAction] エラー:", err);
    return {
      success: false,
      error:
        "発注処理または発注完了メールの送信のいずれかが失敗しています。お手数ですがお問合せよりDUCEにご連絡ください。",
    };
  }
}
