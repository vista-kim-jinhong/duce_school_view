import { PATH } from "@/lib/constants/path";
import { getSessionCookie } from "@/lib/cookie/session";
import { redirect } from "next/navigation";

/**
 * Server Side Components Root Component
 * @description School Viewアプリケーションのルートコンポーネント
 * @returns {JSX.Element}
 */
export default async function SchoolViewApp() {
  const session = await getSessionCookie();

  // 認証状態に応じてリダイレクト
  if (session) {
    redirect(PATH.MAIN);
  }
  redirect(PATH.LOGIN);
}
