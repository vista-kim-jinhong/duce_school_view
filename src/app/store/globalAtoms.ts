/**
 * =================================================
 * グローバルAtom定義
 * @description アプリ全体で共有する状態管理
 * =================================================
 */
import { atom } from "jotai";
import type { SessionPayload } from "@/lib/cookie/types";

// =================================================
// セッション
// =================================================

/**
 * ログインユーザーのセッション情報
 * @description ログイン成功時に設定、ログアウト時にnullへリセット
 */
export const userInfoAtom = atom<SessionPayload | null>(null);

/**
 * ログイン状態
 * @description userInfoAtomから派生する読み取り専用atom
 */
export const isLoginAtom = atom((get) => get(userInfoAtom) !== null);

/**
 * グローバルなローディング状態
 */
export const isLoadingAtom = atom<boolean>(false);
