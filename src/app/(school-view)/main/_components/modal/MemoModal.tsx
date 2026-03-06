"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  closeMemoModalAtom,
  isMemoModalOpenAtom,
  isMemoSavingAtom,
  memoModalDataAtom,
} from "../../_store/memoModal";
import { ankenListAtom } from "../../_store";
import { upsertMemoAction } from "../../_actions/upsertMemoAction";
import AppButton from "@/components/ui/AppButton/AppButton";
import { formatDateTime } from "@/lib/utils/date";
import { userInfoAtom } from "@/app/store/globalAtoms";

/**
 * Client-Side-Component: Memo Modal
 * @description 学内用メモの閲覧・編集・保存を行うモーダルコンポーネント
 * @returns JSX.Element | null
 */
export default function MemoModal() {
  const userInfo = useAtomValue(userInfoAtom);
  const loginId = userInfo?.loginId ?? "";
  const isOpen = useAtomValue(isMemoModalOpenAtom);
  const modalData = useAtomValue(memoModalDataAtom);
  const isSaving = useAtomValue(isMemoSavingAtom);
  const closeModal = useSetAtom(closeMemoModalAtom);
  const setIsSaving = useSetAtom(isMemoSavingAtom);
  const setAnkenList = useSetAtom(ankenListAtom);

  const [memoValue, setMemoValue] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // モーダルが開くたびに初期値をセット
  useEffect(() => {
    if (isOpen && modalData) {
      setMemoValue(modalData.currentMemo);
      setUpdatedAt(modalData.updatedAt);
      setErrorMsg("");
      setTimeout(() => textareaRef.current?.focus(), 100);
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

  // 保存処理
  const handleSave = useCallback(async () => {
    if (!modalData) return;
    setIsSaving(true);
    setErrorMsg("");

    // API呼び出し
    const result = await upsertMemoAction(modalData.recordId, memoValue);
    if (result.success) {
      setUpdatedAt(result.updatedAt ?? "");

      // atom のメモ値をインプレースで更新 (再フェッチなし)
      setAnkenList((prev) =>
        prev.map((anken) => {
          if (anken.$id.value !== modalData.recordId) return anken;

          const existingRows = [...anken.個別学内用メモ.value];
          const newRow = {
            value: {
              ログイン別メモ: { value: memoValue },
              ログイン別メモ更新日時: { value: result.updatedAt ?? "" },
              メモ識別用ログインID: { value: loginId },
            },
          };
          const matchIndex = existingRows.findIndex(
            (row) => row.value.メモ識別用ログインID.value === loginId,
          );
          if (matchIndex !== -1) {
            existingRows[matchIndex] = newRow;
          } else {
            existingRows.push(newRow);
          }

          return {
            ...anken,
            学内用メモ: { value: memoValue },
            個別学内用メモ: { value: existingRows },
          };
        }),
      );

      closeModal();
    } else {
      setErrorMsg(result.error ?? "保存に失敗しました。");
    }

    setIsSaving(false);
  }, [modalData, memoValue, setIsSaving, setAnkenList, closeModal, loginId]);

  // モーダルが閉じていて、かつデータもない場合は何もレンダリングしない
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
        aria-labelledby="memo-modal-title"
        className={[
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "transition-all duration-200",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
      >
        <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2
              id="memo-modal-title"
              className="text-base font-semibold text-gray-800"
            >
              お客様用メモ
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
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* 注意書き */}
            <div className="text-sm text-gray-600 leading-relaxed">
              <p>学校・施設様用のメモ欄です。※DUCEには公開されません。</p>
              <p>
                DUCEへのご連絡は、案件一覧の「お問合せ」ボタンをご利用ください。
              </p>
              <p className="mt-1 font-semibold text-red-500">
                ※発注後のキャンセル・変更は承っておりませんのでご注意ください。
              </p>
            </div>

            <hr className="border-gray-200" />

            {/* テキストエリア */}
            <textarea
              ref={textareaRef}
              value={memoValue}
              onChange={(e) => setMemoValue(e.target.value)}
              rows={10}
              placeholder="メモを入力してください..."
              disabled={isSaving}
              className={[
                "w-full rounded-lg border px-3 py-2 text-sm text-gray-800",
                "placeholder:text-gray-400 resize-none",
                "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent",
                "transition-colors",
                isSaving
                  ? "bg-gray-50 cursor-not-allowed border-gray-200"
                  : "bg-white border-gray-300",
              ].join(" ")}
            />

            {/* 更新日時 */}
            {updatedAt && (
              <p className="text-xs text-gray-400">
                更新日時: {formatDateTime(updatedAt)}
              </p>
            )}

            {/* エラーメッセージ */}
            {errorMsg && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}
          </div>

          {/* フッター */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <AppButton
              variant="secondary"
              size="md"
              onClick={closeModal}
              disabled={isSaving}
            >
              閉じる
            </AppButton>
            <AppButton
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={isSaving}
            >
              {isSaving ? "保存中..." : "保存する"}
            </AppButton>
          </div>
        </div>
      </div>
    </>
  );
}
