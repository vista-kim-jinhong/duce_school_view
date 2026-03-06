/**
 * 案件テーブル カラム定義
 * @description カラムのIDとヘッダー文字列を一元管理する定数
 */

/** カラムID定数 */
export const ANKEN_COLUMN = {
  DETAIL: "DETAIL",
  PROJECT_NUMBER: "PROJECT_NUMBER",
  RECEPTION_NUMBER: "RECEPTION_NUMBER",
  BUILDING_NAME: "BUILDING_NAME",
  CONSTRUCTION_NAME: "CONSTRUCTION_NAME",
  DUCE_MANAGER: "DUCE_MANAGER",
  STATUS: "STATUS",
  ESTIMATE: "ESTIMATE",
  COMPLETION_CHECK: "COMPLETION_CHECK",
  INSPECTION_DATE: "INSPECTION_DATE",
  INQUIRY: "INQUIRY",
  MEMO: "MEMO",
} as const;

/** カラムIDの型 */
export type AnkenColumnId = keyof typeof ANKEN_COLUMN;

/** カラムヘッダー文字列 (画面表示用) */
export const ANKEN_COLUMN_HEADER: Record<AnkenColumnId, string> = {
  DETAIL: "詳細",
  PROJECT_NUMBER: "P番",
  RECEPTION_NUMBER: "受付番号",
  BUILDING_NAME: "対象の建物名",
  CONSTRUCTION_NAME: "工事案件名",
  DUCE_MANAGER: "DUCE担当者",
  STATUS: "ステータス",
  ESTIMATE: "見積",
  COMPLETION_CHECK: "完了確認",
  INSPECTION_DATE: "検収日(終了日)",
  INQUIRY: "お問合せ",
  MEMO: "お客様メモ",
};
