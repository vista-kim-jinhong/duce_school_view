/**
 * =================================================
 * Cookie型定義
 * =================================================
 */

/**
 * JWTペイロード（セッション情報）
 * @description ログイン成功時にJWTに格納するユーザー情報
 */
export interface SessionPayload {
  /** 取引先番号 */
  clientId: string;
  /** ログインID */
  loginId: string;
  /** 学校名または会社名 */
  schoolOrCompanyName: string;
  /** TODO.. */
}
