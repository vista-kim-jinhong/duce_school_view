import { atom } from "jotai";
import type { GetFileSasUrlResult } from "@/lib/api/usecase/getFileApi";
import type { ActionRecord, AnkenRecord } from "@/lib/api/types/kintone";

/** 見積書データ (DUCE見積書 / 変更後見積書) */
export interface EstimateFiles {
  /** DUCE見積書 */
  estimates: GetFileSasUrlResult[];
  /** 変更後見積書 */
  changeEstimates: GetFileSasUrlResult[];
}

/** 対応明細 + ファイル情報 */
export interface DetailActionItem {
  /** 対応明細レコード */
  record: ActionRecord;
  /** 作業前写真・動画 */
  preFiles: GetFileSasUrlResult[];
  /** 作業完了後写真・動画 */
  postFiles: GetFileSasUrlResult[];
  /** 作業報告書 */
  reportFiles: GetFileSasUrlResult[];
}

/** 詳細モーダルのデータ */
export interface DetailModalData {
  /** 案件レコード */
  anken: AnkenRecord;
  /** 依頼時添付写真 */
  initFiles: GetFileSasUrlResult[];
  /** 見積書 */
  estimateFiles: EstimateFiles;
  /** 対応明細 + ファイル情報リスト */
  actionItems: DetailActionItem[];
  /** 完了確認ボタン表示フラグ */
  isConfirmStatus: boolean;
  /** 発注ボタン表示フラグ */
  isOrderStatus: boolean;
  /** 未完了連絡ボタン表示フラグ */
  isClaimStatus: boolean;
}

// -------------------------------------------------
// atom 定義
// -------------------------------------------------

/** モーダル開閉状態 */
export const isDetailModalOpenAtom = atom<boolean>(false);

/**
 * モーダルに渡すデータ
 * null = 未取得 / ローディング中
 */
export const detailModalDataAtom = atom<DetailModalData | null>(null);

/** データ取得中ローディング状態 */
export const isDetailLoadingAtom = atom<boolean>(false);

/** エラーメッセージ */
export const detailModalErrorAtom = atom<string>("");

// -------------------------------------------------
// 書き込み専用 派生 atom (アクション)
// -------------------------------------------------

/**
 * モーダルを開く (ローディング状態で開く)
 */
export const openDetailModalAtom = atom(null, (_get, set) => {
  set(detailModalDataAtom, null);
  set(detailModalErrorAtom, "");
  set(isDetailLoadingAtom, true);
  set(isDetailModalOpenAtom, true);
});

/**
 * モーダルにデータをセットする (ローディング完了)
 */
export const setDetailModalDataAtom = atom(
  null,
  (_get, set, data: DetailModalData) => {
    set(detailModalDataAtom, data);
    set(isDetailLoadingAtom, false);
  },
);

/**
 * モーダルにエラーをセットする
 */
export const setDetailModalErrorAtom = atom(
  null,
  (_get, set, error: string) => {
    set(detailModalErrorAtom, error);
    set(isDetailLoadingAtom, false);
  },
);

/**
 * モーダルを閉じる
 */
export const closeDetailModalAtom = atom(null, (_get, set) => {
  set(isDetailModalOpenAtom, false);
  setTimeout(() => {
    set(detailModalDataAtom, null);
    set(isDetailLoadingAtom, false);
    set(detailModalErrorAtom, "");
  }, 300);
});
