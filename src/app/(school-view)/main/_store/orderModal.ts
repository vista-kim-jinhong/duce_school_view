import { atom } from "jotai";
import type { AnkenRecord } from "@/lib/api/types/kintone";

export interface OrderModalData {
  /** 案件レコードID */
  ankenId: string;
  /** 受付番号 (タイトル表示用) */
  uketsukeNo: string;
  /** DUCEからのメッセージ (読み取り専用表示用) */
  messageFromDuce: string;
  /** 案件レコード (atom更新用) */
  anken: AnkenRecord;
}

/** モーダル開閉状態 */
export const isOrderModalOpenAtom = atom<boolean>(false);

/**
 * モーダルに渡すデータ
 * null = 未選択
 */
export const orderModalDataAtom = atom<OrderModalData | null>(null);

/** 送信中ローディング状態 */
export const isOrderSubmittingAtom = atom<boolean>(false);

// -------------------------------------------------
// 書き込み専用 派生 atom (アクション)
// -------------------------------------------------

/**
 * モーダルを開く
 */
export const openOrderModalAtom = atom(
  null,
  (_get, set, data: OrderModalData) => {
    set(orderModalDataAtom, data);
    set(isOrderModalOpenAtom, true);
  },
);

/**
 * モーダルを閉じる
 */
export const closeOrderModalAtom = atom(null, (_get, set) => {
  set(isOrderModalOpenAtom, false);
  setTimeout(() => {
    set(orderModalDataAtom, null);
    set(isOrderSubmittingAtom, false);
  }, 300);
});
