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
import { userInfoAtom } from "@/app/store/globalAtoms";
import { useSetAtom } from "jotai";
import styles from "./index.module.css";
import AppLoading from "@/components/ui/AppLoading/AppLoading";
import { useLoginValidation } from "../_hooks";

/**
 * ログインページ - 親コンポーネント
 */
export default function ParentViewComponent() {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // バリデーションフック
  const {
    loginIdError,
    passwordError,
    isFormValid,
    handleLoginIdBlur,
    handlePasswordBlur,
    validateAll,
  } = useLoginValidation(loginId, password);

  // グローバルAtomのセッション情報セット
  const setUserInfo = useSetAtom(userInfoAtom);

  // ログインボタンクリック時の処理
  const handleLogin = async () => {
    if (!isFormValid) {
      validateAll();
      return;
    }

    // エラーリセット＆ローディング開始
    setAuthError(null);
    setLoading(true);

    try {
      const result = await loginAction(loginId, password);
      // ログイン成功時はセッションをセットしてメイン画面へ遷移。失敗時はエラーメッセージを表示。
      if (result.success) {
        setUserInfo(result.session);
        router.push(PATH.MAIN);
        return; // ローディングはそのまま維持
      }

      setAuthError(result.error);
      setLoading(false); // 失敗時のみ解除
    } catch (err) {
      setLoading(false); // エラー時も解除
      console.error("Login error:", err);
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
            DUCE 学校ビュー
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
