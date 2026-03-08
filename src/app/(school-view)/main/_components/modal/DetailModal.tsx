"use client";

/**
 * Client-Side-Component: Detail Modal
 * @description 案件詳細・対応明細・添付ファイルを表示するモーダルコンポーネント
 * @returns JSX.Element | null
 */

import { useCallback, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { XMarkIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import {
  closeDetailModalAtom,
  detailModalDataAtom,
  detailModalErrorAtom,
  isDetailLoadingAtom,
  isDetailModalOpenAtom,
  setDetailModalDataAtom,
  setDetailModalErrorAtom,
} from "../../_store/detailModal";
import { openMemoModalAtom } from "../../_store/memoModal";
import { openInquiryModalAtom } from "../../_store/inquiryModal";
import { openClientConfirmModalAtom } from "../../_store/clientConfirmModal";
import { getDetailAction } from "../../_actions/getDetailAction";
import { userInfoAtom } from "@/app/store/globalAtoms";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppLoading from "@/components/ui/AppLoading/AppLoading";
import type { GetFileSasUrlResult } from "@/lib/api/usecase/getFileApi";
import Image from "next/image";
import { openOrderModalAtom } from "../../_store/orderModal";

export interface DetailModalProps {
  /** 詳細を表示する案件ID (外部から渡す) */
  ankenId: string | null;
}

/**
 * Client-Side-Component: Detail Modal
 * @description 案件詳細・対応明細・添付ファイルを表示するモーダルコンポーネント
 * @returns JSX.Element | null
 */
export default function DetailModal({ ankenId }: DetailModalProps) {
  const isOpen = useAtomValue(isDetailModalOpenAtom);
  const modalData = useAtomValue(detailModalDataAtom);
  const isLoading = useAtomValue(isDetailLoadingAtom);
  const errorMsg = useAtomValue(detailModalErrorAtom);
  const userInfo = useAtomValue(userInfoAtom);

  const closeModal = useSetAtom(closeDetailModalAtom);
  const setData = useSetAtom(setDetailModalDataAtom);
  const setError = useSetAtom(setDetailModalErrorAtom);

  // メモモーダル
  const openMemoModal = useSetAtom(openMemoModalAtom);
  // お問い合わせモーダル
  const openInquiryModal = useSetAtom(openInquiryModalAtom);
  // 完了確認モーダル
  const openClientConfirmModal = useSetAtom(openClientConfirmModalAtom);
  // 発注確定モーダル
  const openOrderModal = useSetAtom(openOrderModalAtom);

  const loginId = userInfo?.loginId ?? "";

  // モーダルが開いたらデータ取得
  useEffect(() => {
    if (!isOpen || !ankenId) return;

    (async () => {
      const result = await getDetailAction(ankenId);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error ?? "データの取得に失敗しました。");
      }
    })();
  }, [isOpen, ankenId, setData, setError]);

  // Escキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  // メモモーダルを開く
  const handleOpenMemo = useCallback(() => {
    if (!modalData) return;
    const { anken } = modalData;
    const myNote = anken.個別学内用メモ.value.find(
      (note) => note.value.メモ識別用ログインID.value === loginId,
    );
    closeModal();
    openMemoModal({
      recordId: anken.$id.value,
      uketsukeNo: anken.受付番号.value,
      currentMemo: myNote?.value.ログイン別メモ.value ?? "",
      updatedAt: myNote?.value.ログイン別メモ更新日時.value ?? "",
    });
  }, [modalData, loginId, closeModal, openMemoModal]);

  // お問い合わせモーダルを開く
  const handleOpenInquiry = useCallback(() => {
    if (!modalData) return;
    closeModal();
    openInquiryModal({
      ankenId: modalData.anken.$id.value,
      type: "inquiry",
      actionItems: modalData.actionItems.map((a) => a.record),
      schoolOrCompanyName: userInfo?.schoolOrCompanyName ?? "",
    });
  }, [modalData, userInfo, closeModal, openInquiryModal]);

  // 未完了連絡モーダルを開く
  const handleOpenClaim = useCallback(() => {
    if (!modalData) return;
    closeModal();
    openInquiryModal({
      ankenId: modalData.anken.$id.value,
      type: "claim",
      actionItems: modalData.actionItems.map((a) => a.record),
      schoolOrCompanyName: userInfo?.schoolOrCompanyName ?? "",
    });
  }, [modalData, userInfo, closeModal, openInquiryModal]);

  // 完了確認モーダルを開く
  const handleOpenConfirm = useCallback(() => {
    if (!modalData) return;
    closeModal();
    openClientConfirmModal({
      ankenId: modalData.anken.$id.value,
      actionItems: modalData.actionItems.map((a) => a.record),
    });
  }, [modalData, closeModal, openClientConfirmModal]);

  if (!isOpen && !modalData) return null;

  const anken = modalData?.anken;

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
        aria-labelledby="detail-modal-title"
        className={[
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          "transition-all duration-200",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
      >
        <div className="w-full max-w-5xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
          {/* ヘッダー */}
          <div
            className={[
              "flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 rounded-t-xl",
              modalData?.actionItems.every(
                (a) => a.record.現在の進行状況.value === "検収済み",
              )
                ? "bg-green-50"
                : "bg-blue-50",
            ].join(" ")}
          >
            <h2
              id="detail-modal-title"
              className="text-base font-semibold text-gray-800"
            >
              {anken?.受付番号.value ?? ""}
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
          <div className="px-6 py-5 flex flex-col gap-3 overflow-y-auto">
            {/* ローディング */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <AppLoading size="lg" label="読み込み中..." />
              </div>
            )}

            {/* エラー */}
            {!isLoading && errorMsg && (
              <div className="py-8 text-center text-red-500 text-sm">
                {errorMsg}
              </div>
            )}

            {/* コンテンツ */}
            {!isLoading && !errorMsg && modalData && anken && (
              <>
                {/* 案件情報 */}
                <SectionDivider title="案件情報" />
                <div className="flex flex-col gap-2">
                  <ReadonlyField
                    label="受付番号"
                    value={anken.受付番号.value}
                  />
                  <ReadonlyField
                    label="工事案件名"
                    value={anken.工事案件名.value}
                  />
                  <ReadonlyField
                    label="緊急度"
                    value={anken.ユーザー_緊急度.value}
                  />
                  <ReadonlyField
                    label="依頼者"
                    value={anken.依頼担当者.value}
                  />
                  <ReadonlyField label="依頼日" value={anken.依頼日.value} />
                  <ReadonlyField label="発注日" value={anken.発注日.value} />
                  <ReadonlyField
                    label="発注者名"
                    value={anken.発注者名.value}
                  />
                  <ReadonlyField
                    label="対象の建物"
                    value={anken.問合せ建物名.value}
                  />
                  <ReadonlyField
                    label="クライアント確認日"
                    value={anken.クライアント確認日.value}
                  />
                  <ReadonlyField label="受注日" value={anken.受注日.value} />
                  <ReadonlyField label="検収日" value={anken.検収日.value} />
                  <ReadonlyField
                    label="完了報告"
                    value={anken.完了報告.value}
                  />
                </div>

                {/* 依頼時添付写真 */}
                <SectionDivider title="依頼時添付写真" />
                <div className="flex items-start gap-2">
                  <span className="w-36 shrink-0 text-sm font-medium text-gray-500">
                    依頼時添付写真
                  </span>
                  <FileLinks files={modalData.initFiles} />
                </div>

                {/* 見積書 */}
                <SectionDivider title="見積書" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <span className="w-36 shrink-0 text-sm font-medium text-gray-500">
                      DUCE見積書
                    </span>
                    <FileLinks files={modalData.estimateFiles.estimates} />
                  </div>
                  {modalData.estimateFiles.changeEstimates.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="w-36 shrink-0 text-sm font-medium text-gray-500">
                        変更後見積書
                      </span>
                      <FileLinks
                        files={modalData.estimateFiles.changeEstimates}
                      />
                    </div>
                  )}
                </div>

                {/* メッセージ */}
                <SectionDivider title="メッセージ" />
                <div className="flex flex-col gap-2">
                  <ReadonlyTextarea
                    label="DUCEからのメッセージ"
                    value={anken.DUCEからのメッセージ.value}
                  />
                  <ReadonlyTextarea
                    label="ご請求に関するメッセージ"
                    value={anken.ご請求に関するメッセージ.value}
                  />
                </div>

                {/* 対応明細 */}
                {modalData.actionItems.map((item, index) => (
                  <div key={item.record.$id.value}>
                    <SectionDivider title={`対応明細 ${index + 1}`} />
                    <div className="flex flex-col gap-2">
                      <ReadonlyField
                        label="対応業者"
                        value={item.record.仕入先企業名.value}
                      />
                      <ReadonlyField
                        label="件名・依頼内容"
                        value={item.record["件名・依頼内容"].value}
                      />
                      <ReadonlyField
                        label="依頼分野"
                        value={item.record.依頼分野.value}
                      />
                      <ReadonlyField
                        label="現在の状況"
                        value={item.record.現在の進行状況.value}
                      />
                      <ReadonlyField
                        label="完了日"
                        value={item.record.工事完了日.value}
                      />
                      <ReadonlyTextarea
                        label="依頼内容"
                        value={item.record.仕入内容詳細.value}
                      />

                      {/* 作業前写真 */}
                      <div className="flex items-start gap-2">
                        <span className="w-36 shrink-0 text-sm font-medium text-gray-500">
                          作業前詳細
                        </span>
                        <FileLinks files={item.preFiles} />
                      </div>

                      <ReadonlyTextarea
                        label="中間報告"
                        value={item.record.中間報告.value}
                      />
                      <ReadonlyTextarea
                        label="完了報告"
                        value={item.record.完了報告.value}
                      />

                      {/* 作業後写真・報告書 */}
                      <div className="flex items-start gap-2">
                        <span className="w-36 shrink-0 text-sm font-medium text-gray-500">
                          作業後写真・報告書
                        </span>
                        <div className="flex flex-col gap-1">
                          <FileLinks files={item.postFiles} />
                          <FileLinks files={item.reportFiles} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 学内用メモ */}
                <SectionDivider title="学内用メモ" />
                <ReadonlyTextarea
                  label="学内用メモ"
                  value={anken.学内用メモ.value}
                />
              </>
            )}
          </div>

          {/* フッター */}
          <div className="flex flex-col gap-2 px-6 py-4 border-t border-gray-200 shrink-0">
            {/* 上段: メモ編集(左) + アクションボタン(右) */}
            <div className="flex items-center justify-between gap-3">
              <AppButton
                variant="secondary"
                size="md"
                onClick={handleOpenMemo}
                disabled={isLoading || !modalData}
              >
                お客様用メモを編集する
              </AppButton>

              <div className="flex items-center gap-2">
                {modalData?.isOrderStatus && (
                  <AppButton
                    variant="danger"
                    size="md"
                    onClick={() => {
                      closeModal();
                      openOrderModal({
                        ankenId: modalData.anken.$id.value,
                        uketsukeNo: modalData.anken.受付番号.value,
                        messageFromDuce:
                          modalData.anken.DUCEからのメッセージ.value,
                        anken: modalData.anken,
                      });
                    }}
                  >
                    発注手続きへ
                  </AppButton>
                )}
                {modalData?.isConfirmStatus && (
                  <AppButton
                    variant="primary"
                    size="md"
                    onClick={handleOpenConfirm}
                  >
                    完了を確認
                  </AppButton>
                )}
                {modalData?.isClaimStatus && (
                  <AppButton
                    variant="secondary"
                    size="md"
                    onClick={handleOpenClaim}
                  >
                    完了してない
                  </AppButton>
                )}
                {modalData?.actionItems && modalData.actionItems.length > 0 && (
                  <AppButton
                    variant="secondary"
                    size="md"
                    onClick={handleOpenInquiry}
                  >
                    お問い合わせ
                  </AppButton>
                )}
              </div>
            </div>

            {/* 下段: 閉じる (右寄せ) */}
            <div className="flex justify-end">
              <AppButton variant="primary" size="md" onClick={closeModal}>
                閉じる
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** 読み取り専用フィールド */
function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-44 shrink-0 text-sm font-medium text-gray-500">
        {label}
      </span>
      <span className="flex-1 text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-md px-3 py-2">
        {value ?? "―"}
      </span>
    </div>
  );
}

/** 読み取り専用テキストエリア */
function ReadonlyTextarea({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-44 shrink-0 text-sm font-medium text-gray-500">
        {label}
      </span>
      <span className="flex-1 text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-md px-3 py-2">
        {value ?? "―"}
      </span>
    </div>
  );
}

/** 添付ファイル表示 */
function FileLinks({ files }: { files: GetFileSasUrlResult[] }) {
  if (files.length === 0)
    return <span className="text-sm text-gray-400">―</span>;

  return (
    <div className="flex flex-col gap-1">
      {files.map((file) => (
        <a
          key={file.fileKey}
          href={file.sasUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          {file.contentType.includes("image") ? (
            // 画像はサムネイル表示
            <Image
              src={file.sasUrl}
              alt={file.name}
              width={320}
              height={160}
              className="rounded border border-gray-200 object-contain"
            />
          ) : (
            <>
              <PaperClipIcon className="h-4 w-4 shrink-0" />
              {file.name}
            </>
          )}
        </a>
      ))}
    </div>
  );
}

/** セクション区切り */
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 my-2">
      <hr className="flex-1 border-gray-200" />
      <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
        {title}
      </span>
      <hr className="flex-1 border-gray-200" />
    </div>
  );
}
