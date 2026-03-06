import { atom } from "jotai";
import type { ActionRecord } from "@/lib/api/types/kintone";

export interface ClientConfirmModalData {
  /** 案件レコードID */
  ankenId: string;
  /** 対応明細一覧 (確認対象) */
  actionItems: ActionRecord[];
}

/** モーダル開閉状態 */
export const isClientConfirmModalOpenAtom = atom<boolean>(false);

/**
 * モーダルに渡すデータ
 * null = 未選択
 */
export const clientConfirmModalDataAtom = atom<ClientConfirmModalData | null>(
  null,
);

/** 処理中ローディング状態 */
export const isClientConfirmingAtom = atom<boolean>(false);

// -------------------------------------------------
// 書き込み専用 派生 atom (アクション)
// -------------------------------------------------

/**
 * モーダルを開く
 */
export const openClientConfirmModalAtom = atom(
  null,
  (_get, set, data: ClientConfirmModalData) => {
    set(clientConfirmModalDataAtom, data);
    set(isClientConfirmModalOpenAtom, true);
  },
);

/**
 * モーダルを閉じる
 */
export const closeClientConfirmModalAtom = atom(null, (_get, set) => {
  set(isClientConfirmModalOpenAtom, false);
  setTimeout(() => {
    set(clientConfirmModalDataAtom, null);
    set(isClientConfirmingAtom, false);
  }, 300);
});
