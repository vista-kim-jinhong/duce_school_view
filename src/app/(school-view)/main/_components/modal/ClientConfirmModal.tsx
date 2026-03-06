"use client";

/**
 * Client-Side-Component: Client Confirm Modal
 * @description 対応明細の完了確認を行うモーダルコンポーネント
 * @returns JSX.Element | null
 */

import { useCallback, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

import { updateClientConfirmAction } from "../../_actions/updateClientConfirmAction";
import { ankenListAtom } from "../../_store";
import AppButton from "@/components/ui/AppButton/AppButton";
import {
  clientConfirmModalDataAtom,
  closeClientConfirmModalAtom,
  isClientConfirmingAtom,
  isClientConfirmModalOpenAtom,
} from "../../_store/clientConfirmModal";

/**
 * Client Side Component: Client Confirm Modal
 * @description 対応明細の完了確認を行うモーダルコンポーネント
 * @returns JSX.Element | null
 */
export default function ClientConfirmModal() {
  const isOpen = useAtomValue(isClientConfirmModalOpenAtom);
  const modalData = useAtomValue(clientConfirmModalDataAtom);
  const isConfirming = useAtomValue(isClientConfirmingAtom);
  const closeModal = useSetAtom(closeClientConfirmModalAtom);
  const setIsConfirming = useSetAtom(isClientConfirmingAtom);
  const setAnkenList = useSetAtom(ankenListAtom);

  // Escキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  const handleConfirm = useCallback(async () => {
    if (!modalData) return;
    setIsConfirming(true);

    const actionIds = modalData.actionItems.map((a) => a.$id.value);
    const result = await updateClientConfirmAction(
      actionIds,
      modalData.ankenId,
    );

    if (result.success) {
      const today = new Date().toISOString().split("T")[0];

      // atom をインプレースで更新 (再フェッチなし)
      setAnkenList((prev) =>
        prev.map((anken) => {
          if (anken.$id.value !== modalData.ankenId) return anken;
          return {
            ...anken,
            クライアント確認日: { value: today },
          };
        }),
      );

      closeModal();
    } else {
      alert(result.error ?? "処理に失敗しました。");
      setIsConfirming(false);
    }
  }, [modalData, setIsConfirming, setAnkenList, closeModal]);

  // モーダルが閉じたときにローディング状態をリセット
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
        aria-labelledby="client-confirm-modal-title"
        className={[
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "transition-all duration-200",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
      >
        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2
              id="client-confirm-modal-title"
              className="text-base font-semibold text-gray-800"
            >
              完了確認
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
          <div className="px-6 py-5 flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              以下の対応明細を完了確認します。よろしいですか？
            </p>

            {/* 対応明細一覧 */}
            <ul className="flex flex-col gap-2">
              {modalData?.actionItems.map((action) => (
                <li
                  key={action.$id.value}
                  className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
                >
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-green-500" />
                  <span className="font-medium">{action.受付番号.value}</span>
                  <span className="text-gray-400">—</span>
                  <span className="truncate">
                    {action["件名・依頼内容"].value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* フッター */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <AppButton
              variant="secondary"
              size="md"
              onClick={closeModal}
              disabled={isConfirming}
            >
              キャンセル
            </AppButton>
            <AppButton
              variant="primary"
              size="md"
              onClick={handleConfirm}
              loading={isConfirming}
            >
              {isConfirming ? "処理中..." : "確認する"}
            </AppButton>
          </div>
        </div>
      </div>
    </>
  );
}
