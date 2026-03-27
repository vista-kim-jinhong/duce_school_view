import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_KEYS } from "@/lib/cookie/session";

/**
 * =================================================
 * Middleware
 * @description JWT検証による認証チェック
 * Basic認証設定
 * =================================================
 */
export async function middleware(request: NextRequest) {
  // Basic認証チェック
  const basicAuthResponse = basicAuth(request);
  if (basicAuthResponse) return basicAuthResponse;

  // セッション取得
  const token = request.cookies.get(COOKIE_KEYS.SESSION)?.value;
  if (!token) {
    // 取得失敗したらログイン画面へリダイレクト
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, getSecretKey());
    return NextResponse.next();
  } catch {
    // JWT検証失敗（不正アクセス・期限切れ）
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// middlewareの適用範囲を指定（/main配下の全てのパス）
export const config = {
  matcher: ["/main/:path*"],
};

/**
 * JWTシークレットキー取得
 * @returns
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("[middleware] JWT_SECRETが設定されていません");
  return new TextEncoder().encode(secret);
}

/**
 * BASIC Authorization
 * @description 検証用のためあとから削除
 */
function basicAuth(request: NextRequest): NextResponse | null {
  // 認証情報環境変数から取得
  const basicUser = process.env.BASIC_USER;
  const basicPassword = process.env.BASIC_PASSWORD;

  // 環境変数未設定の場合
  if (!basicUser || !basicPassword) return null;

  // 認証処理
  const authorization = request.headers.get("authorization");
  if (authorization) {
    const [, credentials] = authorization.split(" ");
    const [user, password] = atob(credentials).split(":");
    if (user === basicUser && password === basicPassword) return null;
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}
