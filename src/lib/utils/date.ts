/**
 * 現在日時を Kintone 用 ISO 文字列で返す (Asia/Tokyo)
 * 例: "2024-03-15T14:30:00+09:00"
 */
export function getNowJST(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds()) +
    "+09:00"
  );
}

/**
 * 日付関連のユーティリティ関数
 * @param isoStr ISO形式の日時文字列
 * @returns フォーマットされた日時文字列 (YYYY-MM-DD HH:mm)
 */
export function formatDateTime(isoStr: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}
