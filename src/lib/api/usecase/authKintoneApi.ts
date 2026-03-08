import { kintoneGet } from "../kintoneClient";
import type { SessionPayload } from "@/lib/cookie/types";

/**
 * Kintone 認証用レコード
 */
interface AuthRecord {
  $id: { value: string };
  ログインID: { value: string };
  "学校・会社名": { value: string };
  取引先番号: { value: string };
}

interface KintoneRecordsResponse {
  records: AuthRecord[];
  totalCount: string | null;
}

// =================================================
// 認証処理
// =================================================

/**
 * ログインID・パスワードでKintone認証
 * @param loginId - ログインID
 * @param password - パスワード
 * @returns SessionPayload（認証成功時） | null（認証失敗時）
 */
export async function authKintone(
  loginId: string,
  password: string,
): Promise<SessionPayload | null> {
  const appId = process.env.KINTONE_AUTH_APP_ID;
  const apiToken = process.env.KINTONE_AUTH_APP_TOKEN;

  if (!appId)
    throw new Error("[authKintone] KINTONE_AUTH_APP_ID が設定されていません");
  if (!apiToken)
    throw new Error(
      "[authKintone] KINTONE_AUTH_APP_TOKEN が設定されていません",
    );

  const query = `ログインID = "${loginId}" and パスワード = "${password}"`;

  const data = await kintoneGet<KintoneRecordsResponse>(
    "/k/v1/records.json",
    apiToken,
    { app: appId, query },
  );

  // 1件一致のみ認証成功
  if (data.records.length !== 1) return null;

  const record = data.records[0];

  return {
    clientId: record.$id.value,
    loginId: record["ログインID"].value,
    schoolOrCompanyName: record["学校・会社名"].value,
  };
}
