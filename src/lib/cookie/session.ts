/**
 * =================================================
 * セッションCookie操作ユーティリティ (Server Only)
 * @description JWTを使用したセッション管理
 * =================================================
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "./types";

// =================================================
// 定数
// =================================================

export const COOKIE_KEYS = {
  SESSION: "dsv_session",
} as const;

const COOKIE_MAX_AGE = 60 * 60 * 8; // 8時間

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

// =================================================
// 内部ユーティリティ
// =================================================

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("[session] JWT_SECRETが設定されていません");
  return new TextEncoder().encode(secret);
}

// =================================================
// JWT 署名・検証
// =================================================

/**
 * SessionPayloadをJWTに署名して返す
 * @param payload - セッション情報
 * @returns 署名済みJWT文字列
 */
async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecretKey());
}

/**
 * JWTを検証してSessionPayloadを返す
 * @param token - JWT文字列
 * @returns SessionPayload | null
 */
async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// =================================================
// 公開API
// =================================================

/**
 * セッションCookieを設定
 * @param session - セッション情報
 */
export async function setSessionCookie(session: SessionPayload): Promise<void> {
  const token = await signSession(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_KEYS.SESSION, token, COOKIE_OPTIONS);
}

/**
 * セッションCookieを取得・検証
 * @returns SessionPayload | null
 */
export async function getSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_KEYS.SESSION);

  if (!raw?.value) return null;

  return verifySession(raw.value);
}

/**
 * 認証済みかどうか確認
 * @returns boolean
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSessionCookie();
  return session !== null;
}

/**
 * セッションCookieを削除（ログアウト時）
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_KEYS.SESSION);
}
