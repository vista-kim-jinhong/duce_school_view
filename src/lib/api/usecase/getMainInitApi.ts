/**
 * =================================================
 * メイン画面 初期データ取得API
 * @description vendorNo をもとに建物→対応→案件の順で Kintone からデータを取得する
 * =================================================
 */
import { kintoneGet } from "@/lib/api/kintoneClient";
import type {
  ActionRecord,
  AnkenRecord,
  BldgRecord,
  KintoneRecordsResponse,
} from "@/lib/api/types/kintone";

export interface MainInitData {
  ankenList: AnkenRecord[];
  actionItems: ActionRecord[];
}

/**
 * 取引先番号から使用建物一覧を取得
 */
async function getBldgsByVendorNo(vendorNo: string): Promise<BldgRecord[]> {
  const appId = process.env.KINTONE_BLD_USER_REL_ID;
  const apiToken = process.env.KINTONE_BLD_USER_REL_TOKEN;

  if (!appId)
    throw new Error(
      "[getBldgsByVendorNo] KINTONE_BLD_USER_REL_APP_ID が設定されていません",
    );
  if (!apiToken)
    throw new Error(
      "[getBldgsByVendorNo] KINTONE_BLD_USER_REL_APP_TOKEN が設定されていません",
    );

  const query = `取引先レコード番号 = ${vendorNo}`;
  const data = await kintoneGet<KintoneRecordsResponse<BldgRecord>>(
    "/k/v1/records.json",
    apiToken,
    {
      app: appId,
      query,
      fields: ["建物名ルックアップ", "建物レコード番号", "建物コード"],
    },
  );

  return data.records;
}

/**
 * 建物一覧から対応明細を取得
 */
async function getActionsByBldgs(bldgs: BldgRecord[]): Promise<ActionRecord[]> {
  const appId = process.env.KINTONE_TAIOU_APP_ID;
  const apiToken = process.env.KINTONE_TAIOU_APP_TOKEN;

  if (!appId)
    throw new Error(
      "[getActionsByBldgs] KINTONE_TAIOU_APP_ID が設定されていません",
    );
  if (!apiToken)
    throw new Error(
      "[getActionsByBldgs] KINTONE_TAIOU_APP_TOKEN が設定されていません",
    );

  if (bldgs.length === 0) return [];

  const bldgCodes = bldgs.map((b) => `"${b.建物コード.value}"`).join(", ");

  const query =
    `建物コード in (${bldgCodes})` +
    ` and 学校公開 in ("する")` +
    ` and 現在の進行状況 not in ("キャンセル")` +
    ` order by 受付番号 desc limit 500`;

  const data = await kintoneGet<KintoneRecordsResponse<ActionRecord>>(
    "/k/v1/records.json",
    apiToken,
    { app: appId, query },
  );

  return data.records;
}

/**
 * 建物一覧・ログインIDから案件一覧を取得
 */
async function getAnkenList(
  bldgs: BldgRecord[],
  loginId: string,
): Promise<AnkenRecord[]> {
  const appId = process.env.KINTONE_ANKEN_APP_ID;
  const apiToken = process.env.KINTONE_ANKEN_APP_TOKEN;

  if (!appId)
    throw new Error("[getAnkenList] KINTONE_ANKEN_APP_ID が設定されていません");
  if (!apiToken)
    throw new Error(
      "[getAnkenList] KINTONE_ANKEN_APP_TOKEN が設定されていません",
    );

  if (bldgs.length === 0) return [];

  const bldgCodes = bldgs.map((b) => `"${b.建物コード.value}"`).join(", ");

  // 見積折半「する」の場合は公開先ログインIDで絞り込む
  const query =
    `建物コード in (${bldgCodes})` +
    ` and 学校Viewへの表示 in ("公開", "")` +
    ` and ((見積折半 in ("する")` +
    ` and ((公開先１ログインID = "${loginId}" and 学校Viewの表示１ in ("公開"))` +
    ` or (公開先２ログインID = "${loginId}" and 学校Viewの表示２ in ("公開"))` +
    ` or (公開先３ログインID = "${loginId}" and 学校Viewの表示３ in ("公開"))))` +
    ` or (見積折半 in ("しない", "")))` +
    ` order by 受付番号 desc, レコード番号 desc limit 500`;

  const data = await kintoneGet<KintoneRecordsResponse<AnkenRecord>>(
    "/k/v1/records.json",
    apiToken,
    { app: appId, query },
  );

  return data.records;
}

// =================================================
// メイン (page.tsx から呼び出す)
// =================================================

/**
 * メイン画面の初期データを一括取得
 * @param vendorNo - 取引先番号 (JWT ペイロードから取得)
 * @param loginId  - ログインID (JWT ペイロードから取得)
 */
export async function getMainInitData(
  vendorNo: string,
  loginId: string,
): Promise<MainInitData> {
  // 1. 建物一覧を取得
  const bldgs = await getBldgsByVendorNo(vendorNo);

  // 2. 建物をもとに対応明細・案件を並列取得
  const [actionItems, ankenList] = await Promise.all([
    getActionsByBldgs(bldgs),
    getAnkenList(bldgs, loginId),
  ]);

  return { ankenList, actionItems };
}
