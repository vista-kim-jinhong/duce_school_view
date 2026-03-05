/**
 * =================================================
 * メイン画面 ページ (Server Component)
 * @description セッションからユーザー情報を取得し、Kintoneデータを取得して
 *              クライアントコンポーネントに渡す
 * =================================================
 */
import { redirect } from "next/navigation";
import { getSessionCookie } from "@/lib/cookie/session";
import { getMainInitData } from "@/lib/api/usecase/getMainInitApi";
import ParentViewComponent from "./_components";
import { PATH } from "@/lib/constants/path";

/**
 * Server-side-rendered Main Page
 * @description 認証チェックと初期データ取得を行い、クライアントコンポーネントに渡す
 * @returns JSX.Element
 */
export default async function MainPage() {
  // セッション取得・未認証はログインへリダイレクト
  const session = await getSessionCookie();
  if (!session) {
    redirect(PATH.LOGIN);
  }

  const { clientId, loginId, schoolOrCompanyName } = session;

  // Kintoneからメイン画面初期データを取得
  const { ankenList, actionItems } = await getMainInitData(clientId, loginId);

  return (
    <ParentViewComponent
      ankenList={ankenList}
      actionItems={actionItems}
      schoolOrCompanyName={schoolOrCompanyName}
    />
  );
}
