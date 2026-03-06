import { atom } from "jotai";

export interface MemoModalData {
  /** 案件レコードID */
  recordId: string;
  /** 受付番号 (モーダルタイトル表示用) */
  uketsukeNo: string;
  /** 現在のメモ本文 (ログインユーザー分) */
  currentMemo: string;
  /** メモ最終更新日時 (表示用) */
  updatedAt: string;
}

// -------------------------------------------------
// atom 定義
// -------------------------------------------------

/** モーダル開閉状態 */
export const isMemoModalOpenAtom = atom<boolean>(false);

/**
 * モーダルに渡すデータ
 * null = 未選択
 */
export const memoModalDataAtom = atom<MemoModalData | null>(null);

/** 保存中ローディング状態 */
export const isMemoSavingAtom = atom<boolean>(false);

// -------------------------------------------------
// 書き込み専用 派生 atom (アクション)
// -------------------------------------------------

/**
 * モーダルを開く
 * @description recordId・受付番号・現在のメモ値をセットしてモーダルを開く
 */
export const openMemoModalAtom = atom(
  null,
  (_get, set, data: MemoModalData) => {
    set(memoModalDataAtom, data);
    set(isMemoModalOpenAtom, true);
  },
);

/**
 * モーダルを閉じる
 * @description 状態をリセットしてモーダルを閉じる
 */
export const closeMemoModalAtom = atom(null, (_get, set) => {
  set(isMemoModalOpenAtom, false);
  // アニメーション完了後にデータをクリア
  setTimeout(() => {
    set(memoModalDataAtom, null);
    set(isMemoSavingAtom, false);
  }, 300);
});
