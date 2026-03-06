import { kintoneGet, kintonePut } from "@/lib/api/kintoneClient";
import type {
  AnkenRecord,
  KintoneRecordResponse,
  SchoolNoteTableRow,
} from "@/lib/api/types/kintone";

/**
 * =================================================
 * 学内用メモ保存 API
 * @description ログインユーザーの메モを 個別学内用メモ テーブルに upsert する
 *              - メモ識別用ログインID が一致する行を更新
 *              - 一致しない場合は新規行を追加
 *              - 最初の行が空白の場合は上書き (Kintone テーブルの初期状態対応)
 * =================================================
 */

/**
 * 現在日時を Kintone 用 ISO 文字列で返す (Asia/Tokyo)
 * 例: "2024-03-15T14:30:00+09:00"
 */
function getNowJST(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds()) +
    "+09:00"
  );
}

/**
 * Kintone テーブル行を upsert する
 * @description PHP版 saveSchoolNote のロジックを移植
 */
function upsertTableRows(
  existingRows: SchoolNoteTableRow[],
  loginId: string,
  newMemo: string,
  updatedAt: string,
): SchoolNoteTableRow[] {
  const rows = [...existingRows];
  const newRowValue: SchoolNoteTableRow = {
    value: {
      ログイン別メモ: { value: newMemo },
      ログイン別メモ更新日時: { value: updatedAt },
      メモ識別用ログインID: { value: loginId },
    },
  };

  // ケース1: 最初の行が空白 (Kintone テーブル初期状態) → 上書き
  if (rows.length === 0 || !rows[0].value.メモ識別用ログインID.value) {
    rows[0] = newRowValue;
    return rows;
  }

  // ケース2: loginId が一致する行を更新
  const matchIndex = rows.findIndex(
    (row) => row.value.メモ識別用ログインID.value === loginId,
  );

  if (matchIndex !== -1) {
    rows[matchIndex] = newRowValue;
    return rows;
  }

  // ケース3: 一致なし → 末尾に新規追加
  rows.push(newRowValue);
  return rows;
}

// -------------------------------------------------
// 公開 API
// -------------------------------------------------

export interface UpsertMemoParams {
  /** 案件レコードID */
  recordId: string;
  /** 保存するメモ本文 */
  memo: string;
  /** ログインユーザーID */
  loginId: string;
}

export interface UpsertMemoResult {
  /** 保存後の更新日時 (表示用) */
  updatedAt: string;
}

/**
 * 学内用メモを保存する
 * 1. 案件レコードを取得して既存テーブルを読み込む
 * 2. loginId で upsert
 * 3. Kintone PUT で更新
 */
export async function upsertMemoApi(
  params: UpsertMemoParams,
): Promise<UpsertMemoResult> {
  const appId = process.env.KINTONE_ANKEN_APP_ID;
  const apiToken = process.env.KINTONE_ANKEN_APP_TOKEN;

  if (!appId)
    throw new Error(
      "[upsertMemoApi] KINTONE_ANKEN_APP_ID が設定されていません",
    );
  if (!apiToken)
    throw new Error(
      "[upsertMemoApi] KINTONE_ANKEN_APP_TOKEN が設定されていません",
    );

  // 1. 現在のレコードを取得
  const current = await kintoneGet<KintoneRecordResponse<AnkenRecord>>(
    "/k/v1/record.json",
    apiToken,
    { app: appId, id: params.recordId },
  );

  const existingRows = current.record.個別学内用メモ.value;

  // 2. upsert
  const updatedAt = getNowJST();
  const updatedRows = upsertTableRows(
    existingRows,
    params.loginId,
    params.memo,
    updatedAt,
  );

  // 3. PUT
  await kintonePut("/k/v1/record.json", apiToken, {
    app: appId,
    id: params.recordId,
    record: {
      個別学内用メモ: {
        value: updatedRows,
      },
    },
  });

  return { updatedAt };
}
