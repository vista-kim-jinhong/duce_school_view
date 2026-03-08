/**
 * =================================================
 * Azure Blob Storage 共通ユーティリティ
 * @description kintoneから取得したファイルをBlobにキャッシュし、
 *              SAS URLを発行してクライアントに返す
 *
 * キャッシュ戦略:
 *  - Blobに {prefix}/{fileKey}.{ext} が存在すれば再利用
 *  - 存在しない場合は kintone から取得して Blob に保存
 *  - SAS URL の有効期限: 1時間 (必要に応じて変更可)
 *  - Blob 自体の有効期限: なし (必要なら lifecycle policy で管理)
 * =================================================
 */

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

// -------------------------------------------------
// 内部ユーティリティ
// -------------------------------------------------

/**
 * BlobServiceClient を生成する
 * @throws 環境変数が未設定の場合
 */
function getBlobServiceClient(): BlobServiceClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error(
      "[azureBlob] AZURE_STORAGE_CONNECTION_STRING が設定されていません",
    );
  }
  return BlobServiceClient.fromConnectionString(connectionString);
}

/**
 * コンテナ名を取得する
 * @throws 環境変数が未設定の場合
 */
function getContainerName(): string {
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  if (!containerName) {
    throw new Error(
      "[azureBlob] AZURE_STORAGE_CONTAINER_NAME が設定されていません",
    );
  }
  return containerName;
}

/**
 * キャッシュプレフィックスを取得する
 */
function getCachePrefix(): string {
  return process.env.AZURE_STORAGE_CACHE_PREFIX ?? "school-view/cache";
}

/**
 * MIMEタイプから拡張子を取得する
 * @param contentType - MIMEタイプ
 * @returns 拡張子 (ドット付き)
 */
function getExtFromContentType(contentType: string): string {
  if (contentType.includes("pdf")) return ".pdf";
  if (contentType.includes("msword")) return ".doc";
  if (contentType.includes("wordprocessingml.document")) return ".docx";
  if (contentType.includes("excel")) return ".xls";
  if (contentType.includes("spreadsheetml.sheet")) return ".xlsx";
  if (contentType.includes("powerpoint")) return ".ppt";
  if (contentType.includes("presentationml.presentation")) return ".pptx";
  if (contentType.includes("jpeg") || contentType.includes("jpg"))
    return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("mp4")) return ".mp4";
  if (contentType.includes("mov")) return ".mov";
  // その他は拡張子なし
  return "";
}

/**
 * Blob名を生成する
 * @param fileKey - kintone ファイルキー
 * @param contentType - MIMEタイプ
 * @returns {prefix}/{fileKey}{ext} 形式のBlob名
 */
function buildBlobName(fileKey: string, contentType: string): string {
  const prefix = getCachePrefix();
  const ext = getExtFromContentType(contentType);
  return `${prefix}/${fileKey}${ext}`;
}

// -------------------------------------------------
// 公開 API
// -------------------------------------------------

/**
 * Blobが存在するか確認する
 * @param blobName - Blob名
 * @returns 存在する場合 true
 */
export async function blobExists(blobName: string): Promise<boolean> {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(getContainerName());
  const blobClient = containerClient.getBlobClient(blobName);
  return blobClient.exists();
}

/**
 * ファイルデータをBlobにアップロードする
 * @param blobName - Blob名
 * @param data - アップロードするファイルデータ (Buffer)
 * @param contentType - MIMEタイプ
 */
export async function uploadToBlob(
  blobName: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(getContainerName());
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(data, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
}

/**
 * SAS URLを発行する
 * @description 有効期限1時間のSAS URLを発行する
 * @param blobName - Blob名
 * @returns SAS URL
 */
export async function getSasUrl(blobName: string): Promise<string> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error(
      "[azureBlob] AZURE_STORAGE_CONNECTION_STRING が設定されていません",
    );
  }

  const containerName = getContainerName();

  // ConnectionStringからアカウント名とキーを取得
  const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
  const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);

  if (!accountNameMatch || !accountKeyMatch) {
    throw new Error("[azureBlob] ConnectionStringの形式が不正です");
  }

  const accountName = accountNameMatch[1];
  const accountKey = accountKeyMatch[1];

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey,
  );

  // SAS有効期限: 1時間
  const expiresOn = new Date();
  expiresOn.setHours(expiresOn.getHours() + 1);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // 読み取りのみ
      expiresOn,
    },
    sharedKeyCredential,
  ).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
}

/**
 * kintoneファイルキーからBlobキャッシュのSAS URLを取得する
 * @description
 *  1. Blobに既存キャッシュがあればSAS URLを返す
 *  2. なければ kintoneからファイルを取得してBlobに保存し、SAS URLを返す
 *
 * @param fileKey - kintone ファイルキー
 * @param contentType - MIMEタイプ
 * @param fetcher - kintoneからファイルを取得する関数
 * @returns SAS URL
 */
export async function getOrCacheFileSasUrl(
  fileKey: string,
  contentType: string,
  fetcher: () => Promise<Buffer>,
): Promise<string> {
  const blobName = buildBlobName(fileKey, contentType);

  // キャッシュ確認
  const exists = await blobExists(blobName);

  if (!exists) {
    // kintoneから取得してBlobに保存
    const data = await fetcher();
    await uploadToBlob(blobName, data, contentType);
  }

  // SAS URL発行
  return getSasUrl(blobName);
}
