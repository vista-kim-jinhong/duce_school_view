import { atom } from "jotai";
import type { ActionRecord } from "@/lib/api/types/kintone";

export type InquiryType = "inquiry" | "claim";

export interface InquiryModalData {
  /** 案件レコードID */
  ankenId: string;
  /** 問い合わせタイプ */
  type: InquiryType;
  /** 案件に紐づく対応明細一覧 (セレクトボックス用) */
  actionItems: ActionRecord[];
  /** 学校/会社名 (メール送信パラメータ用) */
  schoolOrCompanyName: string;
}

/** モーダル開閉状態 */
export const isInquiryModalOpenAtom = atom<boolean>(false);

/**
 * モーダルに渡すデータ
 * null = 未選択
 */
export const inquiryModalDataAtom = atom<InquiryModalData | null>(null);

/** 送信中ローディング状態 */
export const isInquirySendingAtom = atom<boolean>(false);

// -------------------------------------------------
// 書き込み専用 派生 atom (アクション)
// -------------------------------------------------

/**
 * モーダルを開く
 */
export const openInquiryModalAtom = atom(
  null,
  (_get, set, data: InquiryModalData) => {
    set(inquiryModalDataAtom, data);
    set(isInquiryModalOpenAtom, true);
  },
);

/**
 * モーダルを閉じる
 */
export const closeInquiryModalAtom = atom(null, (_get, set) => {
  set(isInquiryModalOpenAtom, false);
  setTimeout(() => {
    set(inquiryModalDataAtom, null);
    set(isInquirySendingAtom, false);
  }, 300);
});
