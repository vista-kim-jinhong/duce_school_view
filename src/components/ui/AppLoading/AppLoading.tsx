/**
 * =================================================
 * AppLoading Component
 * @description ローディング表示コンポーネント
 * =================================================
 */

type Size = "sm" | "md" | "lg";
type Variant = "spinner" | "overlay";

interface AppLoadingProps {
  size?: Size;
  variant?: Variant;
  label?: string;
}

const sizeStyles: Record<Size, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

const labelSizeStyles: Record<Size, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

/**
 * スピナー単体
 */
function Spinner({ size = "md" }: { size?: Size }) {
  return (
    <span
      className={[
        "inline-block animate-spin rounded-full",
        "border-red-200 border-t-red-700",
        sizeStyles[size],
      ].join(" ")}
    />
  );
}

/**
 * AppLoading
 * @description
 * - variant="spinner" : インライン表示（ボタン内など）
 * - variant="overlay" : 画面全体をオーバーレイ
 */
export default function AppLoading({
  size = "md",
  variant = "spinner",
  label,
}: AppLoadingProps) {
  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
        <Spinner size="lg" />
        {label && (
          <p className="mt-3 text-sm font-medium text-gray-500 tracking-wide">
            {label}
          </p>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Spinner size={size} />
      {label && (
        <span className={["text-gray-500", labelSizeStyles[size]].join(" ")}>
          {label}
        </span>
      )}
    </span>
  );
}
