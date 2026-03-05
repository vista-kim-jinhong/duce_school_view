"use server";

import { clearSessionCookie } from "@/lib/cookie/session";

/**
 * ログアウトアクション
 * @description セッション情報をクリアしてログアウトするサーバーアクション
 */
export async function logoutAction() {
  // middlewareでリダイレクトされるため、ここではセッションCookieを削除するだけでOK
  await clearSessionCookie();
}
