"use client";

import { useCallback, useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  closeOrderModalAtom,
  isOrderModalOpenAtom,
  isOrderSubmittingAtom,
  orderModalDataAtom,
} from "../../_store/orderModal";
import { ankenListAtom } from "../../_store";
import { submitOrderAction } from "../../_actions/submitOrderAction";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppLabel from "@/components/ui/AppLabel/AppLabel";

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/**
 * Client-Side-Component: Order Modal
 * @description 発注確定モーダル。発注者情報・備考を入力し発注を確定する
 * @returns JSX.Element | null
 */
export default function OrderModal() {
  const isOpen = useAtomValue(isOrderModalOpenAtom);
  const modalData = useAtomValue(orderModalDataAtom);
  const isSubmitting = useAtomValue(isOrderSubmittingAtom);
  const closeModal = useSetAtom(closeOrderModalAtom);
  const setIsSubmitting = useSetAtom(isOrderSubmittingAtom);
  const setAnkenList = useSetAtom(ankenListAtom);

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [mail1, setMail1] = useState("");
  const [mail2, setMail2] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // モーダルが開くたびに初期値をセット
  useEffect(() => {
    if (isOpen && modalData) {
      // 既存の発注者情報があれば初期値としてセット
      setName(modalData.anken.発注者名.value ?? "");
      setMail(modalData.anken.発注者メールアドレス.value ?? "");
      setMail1(modalData.anken.発注時メール送信CC1.value ?? "");
      setMail2(modalData.anken.発注時メール送信CC2.value ?? "");
      setRemarks(modalData.anken.備考学校記入.value ?? "");
      setErrorMsg("");
    }
  }, [isOpen, modalData]);

  // Escキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  // バリデーション
  const hasNameError = !name || name.trim().length === 0;
  const hasMailError = !mail || !isValidEmail(mail);
  const hasError = hasNameError || hasMailError;

  const handleSubmit = useCallback(async () => {
    if (hasError || !modalData) return;
    setIsSubmitting(true);
    setErrorMsg("");

    const result = await submitOrderAction({
      ankenId: modalData.ankenId,
      uketsukeNo: modalData.uketsukeNo,
      name,
      mail,
      cc1: mail1,
      cc2: mail2,
      remarks,
    });

    if (result.success) {
      // atom をインプレースで更新 (再フェッチなし)
      setAnkenList((prev) =>
        prev.map((anken) => {
          if (anken.$id.value !== modalData.ankenId) return anken;
          return {
            ...anken,
            発注日: { value: result.orderDate ?? "" },
            発注者名: { value: name },
            発注者メールアドレス: { value: mail },
            発注時メール送信CC1: { value: mail1 },
            発注時メール送信CC2: { value: mail2 },
            備考学校記入: { value: remarks },
          };
        }),
      );

      alert(
        "発注いただきありがとうございます。\nご入力いただいたメールアドレス宛てに発注完了メールを送信しました。\nメールが届かない場合はお手数ですがお問合せよりDUCEにご連絡ください。",
      );
      closeModal();
    } else {
      setErrorMsg(result.error ?? "発注処理に失敗しました。");
    }

    setIsSubmitting(false);
  }, [
    hasError,
    modalData,
    name,
    mail,
    mail1,
    mail2,
    remarks,
    setIsSubmitting,
    setAnkenList,
    closeModal,
  ]);

  if (!isOpen && !modalData) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* モーダル本体 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        className={[
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "transition-all duration-200",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
      >
        <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <h2
              id="order-modal-title"
              className="text-base font-semibold text-gray-800"
            >
              発注手続き
              {modalData?.uketsukeNo && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  【{modalData.uketsukeNo}】
                </span>
              )}
            </h2>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="閉じる"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* ボディ */}
          <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
            {/* ご発注者 */}
            <div className="flex flex-col gap-1">
              <AppLabel htmlFor="order-name" required>
                ご発注者
              </AppLabel>
              <input
                id="order-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ご発注者をご記入ください"
                disabled={isSubmitting}
                className={[
                  "w-full rounded-md border px-3 py-1.5 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-colors",
                  name.length > 0 && hasNameError
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 bg-white",
                  isSubmitting ? "cursor-not-allowed opacity-50" : "",
                ].join(" ")}
              />
              {name.length > 0 && hasNameError && (
                <p className="text-xs text-red-500">ご発注者をご記入ください</p>
              )}
            </div>

            {/* ご担当者メールアドレス */}
            <div className="flex flex-col gap-1">
              <AppLabel htmlFor="order-mail" required>
                ご担当者メールアドレス
              </AppLabel>
              <input
                id="order-mail"
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="ご担当者メールアドレスをご記入ください"
                disabled={isSubmitting}
                className={[
                  "w-full rounded-md border px-3 py-1.5 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-colors",
                  mail.length > 0 && hasMailError
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 bg-white",
                  isSubmitting ? "cursor-not-allowed opacity-50" : "",
                ].join(" ")}
              />
              {mail.length > 0 && hasMailError && (
                <p className="text-xs text-red-500">
                  正しいメールアドレスをご記入ください
                </p>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* CC説明 */}
            <p className="text-sm text-gray-500">
              ※その他発注完了連絡を送信する連絡先をご入力ください（ご責任者様等）
            </p>

            {/* メールアドレス1 */}
            <div className="flex flex-col gap-1">
              <AppLabel htmlFor="order-mail1">メールアドレス1</AppLabel>
              <input
                id="order-mail1"
                type="email"
                value={mail1}
                onChange={(e) => setMail1(e.target.value)}
                placeholder="メールアドレス1をご記入ください"
                disabled={isSubmitting}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-colors"
              />
            </div>

            {/* メールアドレス2 */}
            <div className="flex flex-col gap-1">
              <AppLabel htmlFor="order-mail2">メールアドレス2</AppLabel>
              <input
                id="order-mail2"
                type="email"
                value={mail2}
                onChange={(e) => setMail2(e.target.value)}
                placeholder="メールアドレス2をご記入ください"
                disabled={isSubmitting}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-colors"
              />
            </div>

            <hr className="border-gray-200" />

            {/* DUCEからのメッセージ (読み取り専用) */}
            <div className="flex flex-col gap-1">
              <AppLabel>DUCEからのメッセージ</AppLabel>
              <textarea
                value={modalData?.messageFromDuce ?? ""}
                rows={3}
                readOnly
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 resize-none cursor-not-allowed"
              />
            </div>

            {/* 備考 */}
            <div className="flex flex-col gap-1">
              <AppLabel htmlFor="order-remarks">備考</AppLabel>
              <textarea
                id="order-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="工事希望日時または注意事項等をご記入ください"
                rows={3}
                disabled={isSubmitting}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-colors"
              />
            </div>

            {/* エラーメッセージ */}
            {errorMsg && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}
          </div>

          {/* フッター */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <AppButton
              variant="secondary"
              size="md"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              閉じる
            </AppButton>
            <AppButton
              variant="danger"
              size="md"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={hasError}
            >
              {isSubmitting ? "処理中..." : "発注を確定する"}
            </AppButton>
          </div>
        </div>
      </div>
    </>
  );
}
