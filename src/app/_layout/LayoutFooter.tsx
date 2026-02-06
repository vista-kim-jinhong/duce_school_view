/**
 * Client Layout Footer Component
 * @description フッターコンポーネント
 * @returns JSX.Element
 */
export default function LayoutFooter() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200">
      <div className="h-12 flex items-center justify-between px-6 text-[11px] text-gray-500">
        <div>© DUCE</div>
        <div>Operated by VISTA ARTS Co., Ltd.</div>
      </div>
    </footer>
  );
}
