/**
 * =================================================
 * Middleware
 * @description JWT検証による認証チェック
 * =================================================
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_KEYS } from "@/lib/cookie/session";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("[middleware] JWT_SECRETが設定されていません");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_KEYS.SESSION)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, getSecretKey());
    return NextResponse.next();
  } catch {
    // JWT検証失敗（改ざん・期限切れ）
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/main/:path*"],
};
