"use server";

/**
 * =================================================
 * ログイン Server Action
 * =================================================
 */
import { authKintone } from "@/lib/api/usecase/authKintoneApi";
import { setSessionCookie } from "@/lib/cookie/session";
import { SessionPayload } from "@/lib/cookie/types";

export interface LoginActionResult {
  success: boolean;
  error: string | null;
  session: SessionPayload | null;
}

// =================================================
// Server Action
// =================================================

/**
 * ログイン処理
 * @param loginId - ログインID
 * @param password - パスワード
 * @returns LoginActionResult
 */
export async function loginAction(
  loginId: string,
  password: string,
): Promise<LoginActionResult> {
  // 入力チェック
  if (!loginId || !password) {
    return {
      success: false,
      error: "ログインIDとパスワードを入力してください",
      session: null,
    };
  }

  try {
    // Kintone認証
    const session = await authKintone(loginId.trim(), password.trim());

    if (!session) {
      return {
        success: false,
        error: "ログインIDまたはパスワードが正しくありません",
        session: null,
      };
    }

    // セッションCookie設定
    await setSessionCookie(session);

    return { success: true, error: null, session };
  } catch (e) {
    console.error("[loginAction]", e);
    return {
      success: false,
      error: "システムエラーが発生しました。しばらくしてから再度お試しください",
      session: null,
    };
  }
}
