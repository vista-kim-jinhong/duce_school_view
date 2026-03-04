/**
 * =================================================
 * Kintone API ベースクライアント (Server Only)
 * @description 全Kintone API呼び出しの共通処理
 *              各ユースケースからAPIトークンを受け取り、リクエストを実行する
 * =================================================
 */

type QueryParams = Record<string, string | number | boolean>;

interface KintoneErrorResponse {
  message: string;
  id: string;
  code: string;
}

/**
 * Kintone APIエラークラス
 * @description Kintone APIからエラーレスポンスが返された場合にスローされる
 */
export class KintoneApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(`[KintoneApiError] ${status} ${code}: ${message}`);
    this.name = "KintoneApiError";
  }
}

// =================================================
// 内部ユーティリティ
// =================================================

/**
 * Kintone ベースURLを取得
 * @returns ベースURL
 * @throws 環境変数が未設定の場合
 */
function getBaseUrl(): string {
  const url = process.env.KINTONE_BASE_URL;
  if (!url)
    throw new Error("[kintoneClient] KINTONE_BASE_URL が設定されていません");
  return url.replace(/\/$/, "");
}

/**
 * リクエストURLを構築
 * @description キーはそのまま、値のみencodeURIComponentでエンコードする
 * @param endpoint - APIエンドポイント (例: /k/v1/records.json)
 * @param params - クエリパラメータ
 * @returns 完全なURL文字列
 */
function buildUrl(endpoint: string, params?: QueryParams): string {
  const base = `${getBaseUrl()}${endpoint}`;
  if (!params || Object.keys(params).length === 0) return base;

  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");

  return `${base}?${query}`;
}

/**
 * GETリクエスト用ヘッダーを構築
 * @description GETリクエストにContent-Typeは不要（Kintoneが拒否するため）
 * @param apiToken - Kintone APIトークン
 */
function buildGetHeaders(apiToken: string): HeadersInit {
  return {
    "X-Cybozu-API-Token": apiToken,
  };
}

/**
 * POST/PUTリクエスト用ヘッダーを構築
 * @param apiToken - Kintone APIトークン
 */
function buildMutationHeaders(apiToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Cybozu-API-Token": apiToken,
  };
}

/**
 * APIレスポンスの共通処理
 * @param response - fetchレスポンス
 * @returns パース済みレスポンスデータ
 * @throws KintoneApiError レスポンスがエラーの場合
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody: KintoneErrorResponse = await response.json().catch(() => ({
      message: "Unknown error",
      id: "",
      code: "UNKNOWN",
    }));
    throw new KintoneApiError(
      response.status,
      errorBody.code,
      errorBody.message,
    );
  }

  return response.json() as Promise<T>;
}

// =================================================
// 公開API
// =================================================

/**
 * Kintone GET リクエスト
 * @param endpoint - APIエンドポイント (例: /k/v1/records.json)
 * @param apiToken - Kintone APIトークン（アプリごとに異なる）
 * @param params - クエリパラメータ
 * @returns レスポンスデータ
 */
export async function kintoneGet<T>(
  endpoint: string,
  apiToken: string,
  params?: QueryParams,
): Promise<T> {
  const response = await fetch(buildUrl(endpoint, params), {
    method: "GET",
    headers: buildGetHeaders(apiToken),
    cache: "no-store",
  });

  return handleResponse<T>(response);
}

/**
 * Kintone POST リクエスト
 * @param endpoint - APIエンドポイント
 * @param apiToken - Kintone APIトークン（アプリごとに異なる）
 * @param body - リクエストボディ
 * @returns レスポンスデータ
 */
export async function kintonePost<T>(
  endpoint: string,
  apiToken: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(buildUrl(endpoint), {
    method: "POST",
    headers: buildMutationHeaders(apiToken),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return handleResponse<T>(response);
}

/**
 * Kintone PUT リクエスト
 * @param endpoint - APIエンドポイント
 * @param apiToken - Kintone APIトークン（アプリごとに異なる）
 * @param body - リクエストボディ
 * @returns レスポンスデータ
 */
export async function kintonePut<T>(
  endpoint: string,
  apiToken: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(buildUrl(endpoint), {
    method: "PUT",
    headers: buildMutationHeaders(apiToken),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  return handleResponse<T>(response);
}
