import { useState } from "react";

/**
 * ログインフォームのバリデーションフック
 * @description ログインIDとパスワードのバリデーション状態と処理を管理する
 */
export function useLoginValidation(loginId: string, password: string) {
  const [loginIdError, setLoginIdError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  /** フォームバリデーション状態 */
  const isFormValid = loginId.trim() !== "" && password.trim() !== "";

  /** ログインIDのblurバリデーション */
  const handleLoginIdBlur = () => {
    setLoginIdError(loginId.trim() ? null : "ログインIDを入力してください");
  };

  /** パスワードのblurバリデーション */
  const handlePasswordBlur = () => {
    setPasswordError(password.trim() ? null : "パスワードを入力してください");
  };

  /** 未入力項目のエラーを強制表示 */
  const validateAll = () => {
    if (!loginId.trim()) setLoginIdError("ログインIDを入力してください");
    if (!password.trim()) setPasswordError("パスワードを入力してください");
  };

  return {
    loginIdError,
    passwordError,
    isFormValid,
    handleLoginIdBlur,
    handlePasswordBlur,
    validateAll,
  };
}
