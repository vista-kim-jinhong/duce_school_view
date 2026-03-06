import { atom } from "jotai";
import {
  PER_PAGE,
  SORT_MODE,
  SORT_PRIORITY,
  type SortMode,
} from "@/lib/constants/type";
import type {
  ActionRecord,
  AnkenRecord,
  EnrichedAnkenRecord,
} from "@/lib/api/types/kintone";

export { type SortMode };

// =================================================
// プリミティブ atom (基本状態)
// =================================================

/** ローディング状態 */
export const isLoadingAtom = atom<boolean>(true);

/** 案件一覧 (Kintone から取得した生データ) */
export const ankenListAtom = atom<AnkenRecord[]>([]);

/** 対応明細一覧 (Kintone から取得した生データ) */
export const actionItemsAtom = atom<ActionRecord[]>([]);

/** テーブルフィルタテキスト */
export const filterTextAtom = atom<string>("");

/** 現在のページ番号 */
export const currentPageAtom = atom<number>(1);

/** ソートモード */
export const sortModeAtom = atom<SortMode>(SORT_MODE.DEFAULT);

/** 詳細モーダル用 選択中案件ID */
export const selectedAnkenIdAtom = atom<string | null>(null);

// =================================================
// 内部ヘルパー
// =================================================

/**
 * ソートモードと案件の状態からソート優先度を算出する
 * @param anken - 加工済み案件レコード
 * @param mode - 現在のソートモード
 * @returns ソート優先度 (大きいほど上位)
 */
function calcPriority(anken: EnrichedAnkenRecord, mode: SortMode): number {
  const isOrderWaiting =
    anken.受注日.value === null &&
    anken.学校公開_DUCE見積書.value === "する" &&
    anken.ステータス.value === "【発注待】";

  const isConfirmWaiting =
    !anken.クライアント確認日.value && anken.isAllAccepted;

  switch (mode) {
    // デフォルト: 発注待ちと完了確認待ちを優先。両方ならさらに優先度高く。
    case SORT_MODE.DEFAULT:
      if (isOrderWaiting && isConfirmWaiting) return SORT_PRIORITY.HIGHEST;
      if (isConfirmWaiting) return SORT_PRIORITY.HIGH;
      if (isOrderWaiting) return SORT_PRIORITY.MIDDLE;
      return SORT_PRIORITY.NORMAL;

    // 発注待ち優先: 発注待ちを最優先、次に完了確認待ち。発注待ちでない案件はすべて同列。
    case SORT_MODE.CONFIRM:
      if (isOrderWaiting && isConfirmWaiting) return SORT_PRIORITY.HIGHEST;
      if (isConfirmWaiting) return SORT_PRIORITY.HIGH;
      if (anken.isAllAccepted) return SORT_PRIORITY.MIDDLE;
      return SORT_PRIORITY.NORMAL;

    // 発注待ち優先: 発注待ちを最優先、次に完了確認待ち。発注待ちでない案件はすべて同列。
    case SORT_MODE.ORDER:
      if (isOrderWaiting && isConfirmWaiting) return SORT_PRIORITY.HIGHEST;
      if (isOrderWaiting) return SORT_PRIORITY.HIGH;
      return SORT_PRIORITY.MIDDLE;
  }
}

// =================================================
// 派生 atom
// =================================================

/**
 * 案件に対応明細・検収状態・残対応数を付与した加工済みリスト
 * @description ankenListAtom と actionItemsAtom から自動計算される
 */
export const enrichedAnkenListAtom = atom<EnrichedAnkenRecord[]>((get) => {
  const ankenList = get(ankenListAtom);
  const actionItems = get(actionItemsAtom);

  return ankenList.map((anken) => {
    const related = actionItems.filter(
      (action) => parseInt(action.工事案件.value) === parseInt(anken.$id.value),
    );

    const cancelCount = related.filter(
      (a) => a.現在の進行状況.value === "キャンセル",
    ).length;

    const acceptedCount = related.filter(
      (a) => a.現在の進行状況.value === "検収済み",
    ).length;

    const isAllAccepted =
      related.length > 0 && related.length === acceptedCount;

    const 残対応数 = related.length - acceptedCount - cancelCount;

    return {
      ...anken,
      対応明細: related,
      対応件数: related.length,
      isAllAccepted,
      残対応数,
    } satisfies EnrichedAnkenRecord;
  });
});

/**
 * ソートモードに応じて数値多段ソートしたリスト
 * @description 優先度 → 受付番号 → レコード番号 の順で降順ソート
 */
export const sortedAnkenListAtom = atom<EnrichedAnkenRecord[]>((get) => {
  const list = get(enrichedAnkenListAtom);
  const mode = get(sortModeAtom);

  return [...list].sort((a, b) => {
    // 1段目: ソート優先度
    const priorityDiff = calcPriority(b, mode) - calcPriority(a, mode);
    if (priorityDiff !== 0) return priorityDiff;

    // 2段目: 受付番号 降順 (ハイフン除去して数値比較)
    const receiptDiff =
      parseInt(b.受付番号.value.replace(/-/g, ""), 10) -
      parseInt(a.受付番号.value.replace(/-/g, ""), 10);
    if (receiptDiff !== 0) return receiptDiff;

    // 3段目: レコード番号 降順
    return parseInt(b.$id.value, 10) - parseInt(a.$id.value, 10);
  });
});

/**
 * フィルタテキストを適用した最終リスト
 * @description プロジェクト番号・受付番号・建物名・案件名・ステータスを対象にフィルタ
 */
export const filteredAnkenListAtom = atom<EnrichedAnkenRecord[]>((get) => {
  const list = get(sortedAnkenListAtom);
  const filter = get(filterTextAtom).trim().toLowerCase();

  if (!filter) return list;

  return list.filter((anken) =>
    [
      anken.プロジェクト番号.value,
      anken.受付番号.value,
      anken.問合せ建物名.value,
      anken.工事案件名.value,
      anken.ステータス.value,
    ]
      .join(" ")
      .toLowerCase()
      .includes(filter),
  );
});

/**
 * フィルタ後の総件数
 * @description ページネーションの総件数表示に使用
 */
export const totalRowsAtom = atom<number>(
  (get) => get(filteredAnkenListAtom).length,
);

/**
 * 現在ページのデータ
 * @description PER_PAGE件ずつスライスして返す
 */
export const pagedAnkenListAtom = atom<EnrichedAnkenRecord[]>((get) => {
  const list = get(filteredAnkenListAtom);
  const page = get(currentPageAtom);
  const start = (page - 1) * PER_PAGE;
  return list.slice(start, start + PER_PAGE);
});
