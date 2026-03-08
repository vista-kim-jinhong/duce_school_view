"use server";

import { getSessionCookie } from "@/lib/cookie/session";
import { sendInquiryApi } from "@/lib/api/usecase/sendInquiryApi";
import type { InquiryType } from "@/app/(school-view)/main/_store/inquiryModal";

export interface SendInquiryActionResult {
  success: boolean;
  error?: string;
}

/**
 * お問い合わせ・未完了連絡メールを送信するサーバーアクション
 * Server Side Action
 * @param actionId - 対応明細レコードID
 * @param type - 問い合わせタイプ (inquiry / claim)
 * @param name - 記入者名
 * @param message - お問い合わせ内容
 */
export async function sendInquiryAction(
  actionId: string,
  type: InquiryType,
  name: string,
  message: string,
): Promise<SendInquiryActionResult> {
  try {
    const session = await getSessionCookie();
    if (!session) {
      return {
        success: false,
        error: "セッションが切れています。再ログインしてください。",
      };
    }

    await sendInquiryApi({
      actionId,
      type,
      name,
      message,
      schoolOrCompanyName: session.schoolOrCompanyName,
    });

    return { success: true };
  } catch (err) {
    console.error("[sendInquiryAction] エラー:", err);
    return {
      success: false,
      error: "送信に失敗しました。時間をおいて再度お試しください。",
    };
  }
}
