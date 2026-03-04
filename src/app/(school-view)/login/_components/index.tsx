"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  LockClosedIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppInput from "@/components/ui/AppInput/AppInput";
import AppLabel from "@/components/ui/AppLabel/AppLabel";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppRow from "@/components/ui/AppRow/AppRow";
import { loginAction } from "../_actions/loginAction";
import { PATH } from "@/lib/constants/path";
import { sessionAtom } from "@/app/store/globalAtoms";
import { useSetAtom } from "jotai";
import styles from "./index.module.css";
import AppLoading from "@/components/ui/AppLoading/AppLoading";

/**
 * ログインページ - 親コンポーネント
 */
export default function ParentViewComponent() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loginIdError, setLoginIdError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // =================================================
  // バリデーション
  // =================================================

  const handleLoginIdBlur = () => {
    if (!loginId.trim()) {
      setLoginIdError("ログインIDを入力してください");
    } else {
      setLoginIdError(null);
    }
  };

  const handlePasswordBlur = () => {
    if (!password.trim()) {
      setPasswordError("パスワードを入力してください");
    } else {
      setPasswordError(null);
    }
  };

  const isFormValid = loginId.trim() !== "" && password.trim() !== "";

  // =================================================
  // ログイン処理
  // =================================================

  // グローバルAtomのセッション情報セット
  const setSession = useSetAtom(sessionAtom);

  const handleLogin = async () => {
    if (!isFormValid) {
      if (!loginId.trim()) setLoginIdError("ログインIDを入力してください");
      if (!password.trim()) setPasswordError("パスワードを入力してください");
      return;
    }

    setAuthError(null);
    setLoading(true);

    try {
      // ログインAPI呼び出し
      const result = await loginAction(loginId, password);
      // 認証失敗
      if (result.success) {
        // セッション情報をグローバルAtomにセット
        setSession(result.session);

        // 認証成功 - メインページへ遷移
        router.push(PATH.MAIN);
      }

      // 失敗
      setAuthError(result.error);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ローディング表示 */}
      {loading && <AppLoading variant="overlay" label="ログイン中..." />}
      <AppCard
        center
        className={`w-full max-w-sm ${styles.card}`}
        padding="none"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            DUCE School View
          </h1>
          <p className="mt-1 text-sm text-gray-500">ログイン</p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6">
          <AppRow gap="md" wrap>
            {/* Login ID */}
            <AppRow.Cell span="full">
              <AppLabel htmlFor="login-id">Login ID</AppLabel>
              <AppInput
                id="login-id"
                type="text"
                placeholder="ユーザーID"
                icon={<UserIcon />}
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                onBlur={handleLoginIdBlur}
                error={loginIdError}
                disabled={loading}
              />
            </AppRow.Cell>

            {/* Password */}
            <AppRow.Cell span="full">
              <AppLabel htmlFor="login-password">Password</AppLabel>
              <AppInput
                id="login-password"
                type="password"
                placeholder="パスワード"
                icon={<LockClosedIcon />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                error={passwordError}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </AppRow.Cell>

            {/* 認証エラーメッセージ */}
            {authError && (
              <AppRow.Cell span="full">
                <p className="text-xs text-red-500 text-center">{authError}</p>
              </AppRow.Cell>
            )}

            {/* Login Button */}
            <AppRow.Cell span="full">
              <AppButton
                fullWidth
                icon={<ArrowRightStartOnRectangleIcon />}
                loading={loading}
                onClick={handleLogin}
              >
                Login
              </AppButton>
            </AppRow.Cell>
          </AppRow>
        </div>
      </AppCard>
    </>
  );
}
