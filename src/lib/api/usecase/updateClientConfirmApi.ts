/**
 * =================================================
 * クライアント確認 更新 API
 * @description 対応明細の学校確認日・案件のクライアント確認日を更新する
 *
 * TODO: 複数件処理中に失敗した場合のロールバック処理が未実装
 *       現状は失敗してもそのまま続行する (既存仕様と同様)
 *       kintone API がトランザクションをサポートしていないため
 *       完全なロールバックは困難。要件確認の上、対応を検討すること。
 * =================================================
 */

import { kintoneGet, kintonePut } from "@/lib/api/kintoneClient";
import type {
  AnkenRecord,
  KintoneRecordResponse,
} from "@/lib/api/types/kintone";
import { getTodayJST } from "@/lib/utils/date";

export interface UpdateClientConfirmParams {
  /** 対応明細レコードIDリスト */
  actionIds: string[];
  /** 案件レコードID */
  ankenId: string;
}

/**
 * クライアント確認処理
 * 1. 対応明細の学校確認日を今日の日付で更新 (全件)
 * 2. 案件のクライアント確認日を更新 (既存より新しい日付の場合のみ)
 */
export async function updateClientConfirmApi(
  params: UpdateClientConfirmParams,
): Promise<void> {
  const taiouAppId = process.env.KINTONE_TAIOU_APP_ID;
  const taiouApiToken = process.env.KINTONE_TAIOU_APP_TOKEN;
  const ankenAppId = process.env.KINTONE_ANKEN_APP_ID;
  const ankenApiToken = process.env.KINTONE_ANKEN_APP_TOKEN;

  if (!taiouAppId)
    throw new Error(
      "[updateClientConfirmApi] KINTONE_TAIOU_APP_ID が設定されていません",
    );
  if (!taiouApiToken)
    throw new Error(
      "[updateClientConfirmApi] KINTONE_TAIOU_APP_TOKEN が設定されていません",
    );
  if (!ankenAppId)
    throw new Error(
      "[updateClientConfirmApi] KINTONE_ANKEN_APP_ID が設定されていません",
    );
  if (!ankenApiToken)
    throw new Error(
      "[updateClientConfirmApi] KINTONE_ANKEN_APP_TOKEN が設定されていません",
    );

  const today = getTodayJST();

  // 1. 対応明細の学校確認日を全件更新
  // TODO: 失敗した場合のロールバック処理が未実装 (要件確認が必要)
  for (const actionId of params.actionIds) {
    await kintonePut("/k/v1/record.json", taiouApiToken, {
      app: taiouAppId,
      id: actionId,
      record: {
        学校確認日: { value: today },
      },
    });
  }

  // 2. 案件のクライアント確認日を更新 (既存より新しい日付の場合のみ)
  const { record: anken } = await kintoneGet<
    KintoneRecordResponse<AnkenRecord>
  >("/k/v1/record.json", ankenApiToken, {
    app: ankenAppId,
    id: params.ankenId,
  });

  if (today > (anken.クライアント確認日.value ?? "")) {
    await kintonePut("/k/v1/record.json", ankenApiToken, {
      app: ankenAppId,
      id: params.ankenId,
      record: {
        クライアント確認日: { value: today },
      },
    });
  }
}
