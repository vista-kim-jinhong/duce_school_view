"use server";

/**
 * =================================================
 * 案件詳細データ取得 サーバーアクション
 * @description 案件ID をもとに案件詳細・対応明細・添付ファイルを取得し
 *              Azure Blob Storage にキャッシュした SAS URL を返す
 * =================================================
 */

import { getSessionCookie } from "@/lib/cookie/session";
import { kintoneGet } from "@/lib/api/kintoneClient";
import { getFilesSasUrls } from "@/lib/api/usecase/getFileApi";
import type {
  ActionRecord,
  AnkenRecord,
  KintoneRecordResponse,
  KintoneRecordsResponse,
} from "@/lib/api/types/kintone";
import type {
  DetailActionItem,
  DetailModalData,
  EstimateFiles,
} from "@/app/(school-view)/main/_store/detailModal";

export interface GetDetailActionResult {
  success: boolean;
  data?: DetailModalData;
  error?: string;
}

/**
 * 案件レコードを取得する
 */
async function getAnkenRecord(ankenId: string): Promise<AnkenRecord> {
  const appId = process.env.KINTONE_ANKEN_APP_ID;
  const apiToken = process.env.KINTONE_ANKEN_APP_TOKEN;

  if (!appId)
    throw new Error(
      "[getDetailAction] KINTONE_ANKEN_APP_ID が設定されていません",
    );
  if (!apiToken)
    throw new Error(
      "[getDetailAction] KINTONE_ANKEN_APP_TOKEN が設定されていません",
    );

  const { record } = await kintoneGet<KintoneRecordResponse<AnkenRecord>>(
    "/k/v1/record.json",
    apiToken,
    { app: appId, id: ankenId },
  );

  return record;
}

/**
 * 案件IDに紐づく対応明細一覧を取得する
 */
async function getActionRecords(ankenId: string): Promise<ActionRecord[]> {
  const appId = process.env.KINTONE_TAIOU_APP_ID;
  const apiToken = process.env.KINTONE_TAIOU_APP_TOKEN;

  if (!appId)
    throw new Error(
      "[getDetailAction] KINTONE_TAIOU_APP_ID が設定されていません",
    );
  if (!apiToken)
    throw new Error(
      "[getDetailAction] KINTONE_TAIOU_APP_TOKEN が設定されていません",
    );

  const query = `工事案件 = ${ankenId} and 学校公開 in ("する") and 現在の進行状況 not in ("キャンセル") order by 受付番号 asc`;

  const { records } = await kintoneGet<KintoneRecordsResponse<ActionRecord>>(
    "/k/v1/records.json",
    apiToken,
    { app: appId, query },
  );

  return records;
}

/**
 * ログインIDに対応するDUCE見積書フィールド名を取得する
 * @description 見積折半「する」の場合は公開先ログインIDに対応する見積書を返す
 */
function getEstimateFieldName(
  anken: AnkenRecord,
  loginId: string,
): {
  estimateField: keyof AnkenRecord;
  changeEstimateField: keyof AnkenRecord;
} {
  if (anken.見積折半.value !== "する") {
    return {
      estimateField: "DUCE見積書",
      changeEstimateField: "変更DUCE見積書",
    };
  }

  const destinations = [
    anken.公開先１ログインID.value,
    anken.公開先２ログインID.value,
    anken.公開先３ログインID.value,
  ];
  const index = destinations.findIndex((d) => d === loginId);

  if (index === 0)
    return {
      estimateField: "DUCE見積１",
      changeEstimateField: "変更DUCE見積１",
    };
  if (index === 1)
    return {
      estimateField: "DUCE見積２",
      changeEstimateField: "変更DUCE見積２",
    };
  if (index === 2)
    return {
      estimateField: "DUCE見積３",
      changeEstimateField: "変更DUCE見積３",
    };

  // 公開先に該当なし → 空を返す
  return { estimateField: "DUCE見積書", changeEstimateField: "変更DUCE見積書" };
}

/**
 * 見積書の表示可否を確認する
 * @description 学校Viewへの表示が「公開」かつ見積折半条件を満たす場合のみ表示
 */
function canShowEstimates(anken: AnkenRecord, loginId: string): boolean {
  if (anken.学校Viewへの表示.value !== "公開") return false;
  if (anken.見積折半.value === "しない") return true;
  if (anken.見積折半.value === "する") {
    const destinations = [
      anken.公開先１ログインID.value,
      anken.公開先２ログインID.value,
      anken.公開先３ログインID.value,
    ];
    return destinations.some((d) => d === loginId);
  }
  return false;
}

/**
 * 完了確認ボタン表示フラグを判定する
 * @description 全対応明細が検収済みかつクライアント確認日が未設定の場合
 */
function calcIsConfirmStatus(
  anken: AnkenRecord,
  actionItems: ActionRecord[],
): boolean {
  if (anken.クライアント確認日.value) return false;
  if (actionItems.length === 0) return false;
  return actionItems.every((a) => a.現在の進行状況.value === "検収済み");
}

/**
 * 発注ボタン表示フラグを判定する
 */
function calcIsOrderStatus(anken: AnkenRecord): boolean {
  return (
    anken.学校公開_DUCE見積書.value === "する" &&
    !anken.受注日.value &&
    anken.ステータス.value === "【発注待】"
  );
}

/**
 * 未完了連絡ボタン表示フラグを判定する
 * @description 検収日あり かつ 学校確認日なし の対応明細が存在する場合
 */
function calcIsClaimStatus(actionItems: ActionRecord[]): boolean {
  return actionItems.some((a) => a.検収日.value && !a.学校確認日.value);
}

// -------------------------------------------------
// 公開サーバーアクション
// -------------------------------------------------

/**
 * 案件詳細データを取得するサーバーアクション
 * @param ankenId - 案件レコードID
 */
export async function getDetailAction(
  ankenId: string,
): Promise<GetDetailActionResult> {
  try {
    const session = await getSessionCookie();
    if (!session) {
      return {
        success: false,
        error: "セッションが切れています。再ログインしてください。",
      };
    }

    const { loginId } = session;
    const ankenApiToken = process.env.KINTONE_ANKEN_APP_TOKEN!;
    const taiouApiToken = process.env.KINTONE_TAIOU_APP_TOKEN!;

    // 1. 案件レコード + 対応明細を並列取得
    const [anken, actionRecords] = await Promise.all([
      getAnkenRecord(ankenId),
      getActionRecords(ankenId),
    ]);

    // 2. 依頼時添付写真 (現場写真) の SAS URL を取得
    const initFiles = await getFilesSasUrls(
      anken.現場写真.value,
      ankenApiToken,
    );

    // 3. 見積書の SAS URL を取得
    let estimateFiles: EstimateFiles = { estimates: [], changeEstimates: [] };
    if (canShowEstimates(anken, loginId)) {
      const { estimateField, changeEstimateField } = getEstimateFieldName(
        anken,
        loginId,
      );
      const [estimates, changeEstimates] = await Promise.all([
        getFilesSasUrls(
          (anken[estimateField] as typeof anken.DUCE見積書).value,
          ankenApiToken,
        ),
        getFilesSasUrls(
          (anken[changeEstimateField] as typeof anken.変更DUCE見積書).value,
          ankenApiToken,
        ),
      ]);
      estimateFiles = { estimates, changeEstimates };
    }

    // 4. 対応明細ごとにファイルSAS URLを並列取得
    const actionItems: DetailActionItem[] = await Promise.all(
      actionRecords.map(async (record) => {
        const [preFiles, postFiles, reportFiles] = await Promise.all([
          getFilesSasUrls(record["作業前写真・動画"].value, taiouApiToken),
          getFilesSasUrls(record["作業完了後写真・動画"].value, taiouApiToken),
          getFilesSasUrls(record.作業報告書.value, taiouApiToken),
        ]);
        return { record, preFiles, postFiles, reportFiles };
      }),
    );

    // 5. ボタン表示フラグ
    const isConfirmStatus = calcIsConfirmStatus(anken, actionRecords);
    const isOrderStatus = calcIsOrderStatus(anken);
    const isClaimStatus = calcIsClaimStatus(actionRecords);

    return {
      success: true,
      data: {
        anken,
        initFiles,
        estimateFiles,
        actionItems,
        isConfirmStatus,
        isOrderStatus,
        isClaimStatus,
      },
    };
  } catch (err) {
    console.error("[getDetailAction] エラー:", err);
    return {
      success: false,
      error: "詳細データの取得に失敗しました。時間をおいて再度お試しください。",
    };
  }
}
