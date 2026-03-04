import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-red-700 text-white hover:bg-red-800 border border-transparent",
  secondary: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent",
  danger: "bg-white text-red-700 hover:bg-red-50 border border-red-300",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export default function AppButton({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition",
        "focus:outline-none focus:ring-2 focus:ring-red-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <span className="h-5 w-5">{icon}</span>
      )}
      {children}
    </button>
  );
}
