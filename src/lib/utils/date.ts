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
