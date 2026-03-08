import { getOrCacheFileSasUrl } from "@/lib/utils/azureBlob";
import type { KintoneFile } from "@/lib/api/types/kintone";

//  =================================================
//  kintone ファイル取得 API
//  kintoneからファイルを取得し、Azure Blob Storageにキャッシュする
//  キャッシュが存在する場合はkintoneへのリクエストをスキップし、
//  SAS URLを返す
//  =================================================

/**
 * kintone ベースURLを取得する
 * @throws 環境変数が未設定の場合
 */
function getKintoneBaseUrl(): string {
  const url = process.env.KINTONE_BASE_URL;
  if (!url) {
    throw new Error("[getFileApi] KINTONE_BASE_URL が設定されていません");
  }
  return url.replace(/\/$/, "");
}

/**
 * kintone からファイルをダウンロードし Buffer で返す
 * @param fileKey - kintone ファイルキー
 * @param apiToken - kintone APIトークン
 * @returns ファイルデータ (Buffer)
 */
async function downloadFromKintone(
  fileKey: string,
  apiToken: string,
): Promise<Buffer> {
  const baseUrl = getKintoneBaseUrl();
  const url = `${baseUrl}/k/v1/file.json?fileKey=${encodeURIComponent(fileKey)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Cybozu-API-Token": apiToken,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `[getFileApi] kintoneファイル取得失敗: ${response.status} ${fileKey}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// -------------------------------------------------
// 公開 API
// -------------------------------------------------

export interface GetFileSasUrlParams {
  /** kintone ファイル情報 */
  file: KintoneFile;
  /** kintone APIトークン */
  apiToken: string;
}

export interface GetFileSasUrlResult {
  /** ファイルキー */
  fileKey: string;
  /** ファイル名 */
  name: string;
  /** MIMEタイプ */
  contentType: string;
  /** SAS URL (ブラウザから直接アクセス可能) */
  sasUrl: string;
}

/**
 * kintone ファイルのSAS URLを取得する (単体)
 * @description Blobキャッシュがあればkintoneへのリクエストをスキップする
 * @param params - ファイル情報 + APIトークン
 * @returns SAS URL情報
 */
export async function getFileSasUrl(
  params: GetFileSasUrlParams,
): Promise<GetFileSasUrlResult> {
  const { file, apiToken } = params;

  const sasUrl = await getOrCacheFileSasUrl(
    file.fileKey,
    file.contentType,
    () => downloadFromKintone(file.fileKey, apiToken),
  );

  return {
    fileKey: file.fileKey,
    name: file.name,
    contentType: file.contentType,
    sasUrl,
  };
}

/**
 * kintone ファイルリストのSAS URLを一括取得する
 * @description 複数ファイルを並列取得する
 * @param files - kintone ファイル情報リスト
 * @param apiToken - kintone APIトークン
 * @returns SAS URL情報リスト
 */
export async function getFilesSasUrls(
  files: KintoneFile[],
  apiToken: string,
): Promise<GetFileSasUrlResult[]> {
  if (files.length === 0) return [];

  return Promise.all(files.map((file) => getFileSasUrl({ file, apiToken })));
}
