/**
 * Client Layout Header Component
 * @returns JSX.Element
 */
export default function LayoutHeader() {
  return (
    <header className="bg-red-700 text-white">
      <div className="container-base h-14 flex items-center">
        {/* ロゴ／サービス名 */}
        <h1 className="text-lg font-semibold tracking-wide">
          DUCE School View
        </h1>
      </div>
    </header>
  );
}
