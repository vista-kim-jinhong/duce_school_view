import { kintonePut } from "@/lib/api/kintoneClient";

export interface UpdateOrderParams {
  /** 案件レコードID */
  ankenId: string;
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
 * 発注情報 kintone更新 API
 * @description 発注確定時に案件レコードの発注情報を更新する
 * 発注確定時に案件レコードを更新する
 * 発注者名・メールアドレス・CC・備考・発注日を更新する
 */
export async function updateOrderApi(params: UpdateOrderParams): Promise<void> {
  const appId = process.env.KINTONE_ANKEN_APP_ID;
  const apiToken = process.env.KINTONE_ANKEN_APP_TOKEN;

  if (!appId)
    throw new Error(
      "[updateOrderApi] KINTONE_ANKEN_APP_ID が設定されていません",
    );
  if (!apiToken)
    throw new Error(
      "[updateOrderApi] KINTONE_ANKEN_APP_TOKEN が設定されていません",
    );

  // 発注日: 今日の日付 (Asia/Tokyo)
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  await kintonePut("/k/v1/record.json", apiToken, {
    app: appId,
    id: params.ankenId,
    record: {
      発注者名: { value: params.name },
      発注者メールアドレス: { value: params.mail },
      発注時メール送信CC1: { value: params.cc1 },
      発注時メール送信CC2: { value: params.cc2 },
      備考学校記入: { value: params.remarks },
      発注日: { value: today },
    },
  });
}
