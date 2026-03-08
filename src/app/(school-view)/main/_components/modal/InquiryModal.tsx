"use client";

import { useCallback, useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  closeInquiryModalAtom,
  inquiryModalDataAtom,
  isInquiryModalOpenAtom,
  isInquirySendingAtom,
} from "../../_store/inquiryModal";
import { sendInquiryAction } from "../../_actions/sendInquiryAction";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppLabel from "@/components/ui/AppLabel/AppLabel";

interface ReadonlyFieldProps {
  label: string;
  value: string | null | undefined;
}

/**
 * Client-Side-Component: Inquiry Modal
 * @description お問い合わせ・未完了連絡の送信を行うモーダルコンポーネント
 * @returns JSX.Element | null
 */
export default function InquiryModal() {
  const isOpen = useAtomValue(isInquiryModalOpenAtom);
  const modalData = useAtomValue(inquiryModalDataAtom);
  const isSending = useAtomValue(isInquirySendingAtom);
  const closeModal = useSetAtom(closeInquiryModalAtom);
  const setIsSending = useSetAtom(isInquirySendingAtom);

  // 選択中の対応明細ID
  const [selectedActionId, setSelectedActionId] = useState<string>("");
  // 記入者名
  const [name, setName] = useState("");
  // お問い合わせ内容
  const [message, setMessage] = useState("");
  // エラーメッセージ
  const [errorMsg, setErrorMsg] = useState("");
  // 送信完了フラグ
  const [isSent, setIsSent] = useState(false);

  // モーダルが開くたびに初期値をセット
  useEffect(() => {
    if (isOpen && modalData) {
      setSelectedActionId(
        modalData.actionItems.length > 0
          ? modalData.actionItems[0].$id.value
          : "",
      );
      setName("");
      setMessage("");
      setErrorMsg("");
      setIsSent(false);
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

  // 選択中の対応明細
  const selectedAction = modalData?.actionItems.find(
    (a) => a.$id.value === selectedActionId,
  );

  // バリデーション
  const hasNameError = !name || name.trim().length === 0;
  const hasMessageError =
    !message || message.length === 0 || /^[\s\n\t]+$/.test(message);
  const hasError = hasNameError || hasMessageError;

  // モーダルタイトル
  const dialogTitle =
    modalData?.type === "claim"
      ? `未完了のご連絡 【${selectedAction?.受付番号.value ?? ""}】`
      : `お問い合わせ 【${selectedAction?.受付番号.value ?? ""}】`;

  const handleSend = useCallback(async () => {
    if (hasError || !modalData || !selectedActionId) return;
    setIsSending(true);
    setErrorMsg("");

    const result = await sendInquiryAction(
      selectedActionId,
      modalData.type,
      name,
      message,
    );

    if (result.success) {
      setIsSent(true);
    } else {
      setErrorMsg(result.error ?? "送信に失敗しました。");
    }

    setIsSending(false);
  }, [hasError, modalData, selectedActionId, name, message, setIsSending]);

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
        aria-labelledby="inquiry-modal-title"
        className={[
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "transition-all duration-200",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
      >
        <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <h2
              id="inquiry-modal-title"
              className="text-base font-semibold text-gray-800"
            >
              {dialogTitle}
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
            {isSent ? (
              // 送信完了メッセージ
              <div className="py-8 text-center text-green-600 font-medium">
                お問い合わせを送信しました。
              </div>
            ) : (
              <>
                {/* 対応選択 */}
                <div className="flex flex-col gap-1">
                  <AppLabel htmlFor="select-action">お問い合わせ選択</AppLabel>
                  <p className="text-xs text-gray-400 mb-1">
                    以下の送信する内容を選択してください。
                  </p>
                  <select
                    id="select-action"
                    value={selectedActionId}
                    onChange={(e) => setSelectedActionId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    {modalData?.actionItems.map((action) => (
                      <option key={action.$id.value} value={action.$id.value}>
                        {action["件名・依頼内容"].value}
                      </option>
                    ))}
                  </select>
                </div>

                <hr className="border-gray-200" />

                {/* 読み取り専用フィールド */}
                <div className="flex flex-col gap-3">
                  <ReadonlyField label="お問い合わせ種別" value={dialogTitle} />
                  <ReadonlyField
                    label="受付番号"
                    value={selectedAction?.受付番号.value}
                  />
                  <ReadonlyField
                    label="対象の建物"
                    value={selectedAction?.対象の建物.value}
                  />
                  <ReadonlyField
                    label="件名・依頼内容"
                    value={selectedAction?.["件名・依頼内容"].value}
                  />
                  <ReadonlyField
                    label="依頼分野"
                    value={selectedAction?.依頼分野.value}
                  />
                  <ReadonlyField
                    label="対応業者"
                    value={selectedAction?.仕入先企業名.value}
                  />
                </div>

                <hr className="border-gray-200" />

                {/* 記入者 */}
                <div className="flex flex-col gap-1">
                  <AppLabel htmlFor="inquiry-name" required>
                    記入者
                  </AppLabel>
                  <input
                    id="inquiry-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="記入者名をご記入下さい。"
                    disabled={isSending}
                    className={[
                      "w-full rounded-md border px-3 py-1.5 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent",
                      "transition-colors",
                      name.length > 0 && hasNameError
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white",
                      isSending ? "cursor-not-allowed opacity-50" : "",
                    ].join(" ")}
                  />
                  {name.length > 0 && hasNameError && (
                    <p className="text-xs text-red-500">お名前をご記入下さい</p>
                  )}
                </div>

                {/* お問い合わせ内容 */}
                <div className="flex flex-col gap-1">
                  <AppLabel htmlFor="inquiry-message" required>
                    お問い合わせ内容
                  </AppLabel>
                  <textarea
                    id="inquiry-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="お問い合わせ内容を具体的にご記入下さい。"
                    rows={5}
                    disabled={isSending}
                    className={[
                      "w-full rounded-md border px-3 py-2 text-sm resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent",
                      "transition-colors",
                      message.length > 0 && hasMessageError
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 bg-white",
                      isSending ? "cursor-not-allowed opacity-50" : "",
                    ].join(" ")}
                  />
                  {message.length > 0 && hasMessageError && (
                    <p className="text-xs text-red-500">
                      お問い合わせ内容をご記入下さい
                    </p>
                  )}
                </div>

                {/* エラーメッセージ */}
                {errorMsg && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                    {errorMsg}
                  </p>
                )}
              </>
            )}
          </div>

          {/* フッター */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <AppButton
              variant="secondary"
              size="md"
              onClick={closeModal}
              disabled={isSending}
            >
              閉じる
            </AppButton>
            {!isSent && (
              <AppButton
                variant="primary"
                size="md"
                onClick={handleSend}
                loading={isSending}
                disabled={hasError}
              >
                {isSending ? "送信中..." : "送信"}
              </AppButton>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * 読み取り専用フィールドコンポーネント
 * @param label - フィールドラベル
 * @param value - フィールド値
 * @returns JSX.Element
 */
function ReadonlyField({ label, value }: ReadonlyFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <AppLabel className="w-28 shrink-0">{label}</AppLabel>
      <span className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
        {value ?? ""}
      </span>
    </div>
  );
}
