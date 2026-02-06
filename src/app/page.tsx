import { PATH } from "@/lib/constants/path";
import { redirect } from "next/navigation";

/**
 * Server Side Components Root Component
 * @description School Viewアプリケーションのルートコンポーネント
 * @returns {JSX.Element}
 */
export default function SchoolViewApp() {
  const isSessionActive = true; // TODO::Get Cookie or Session

  // TODO::認証チェックする
  // Sessionが生きていればメイン画面へリダイレクト
  // まだSessionがない場合はログイン画面へリダイレクト
  // PATH まとめ

  if (isSessionActive) {
    redirect(PATH.MAIN);
  }
  redirect(PATH.LOGIN);
}
