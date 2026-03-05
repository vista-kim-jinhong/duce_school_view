/** ソートモード */
export const SORT_MODE = {
  DEFAULT: "default",
  CONFIRM: "confirm",
  ORDER: "order",
} as const;

export type SortMode = (typeof SORT_MODE)[keyof typeof SORT_MODE];

/** ソート優先度 */
export const SORT_PRIORITY = {
  HIGHEST: 3, // 発注待ち && 完了確認待ち
  HIGH: 2, // どちらか一方
  MIDDLE: 1, // 残対応あり
  NORMAL: 0, // その他
} as const;

/** 1ページあたりの表示件数 */
export const PER_PAGE = 20;
