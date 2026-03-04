import { InputHTMLAttributes, ReactNode } from "react";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
  icon?: ReactNode;
}

export default function AppInput({
  error,
  icon,
  className = "",
  ...props
}: AppInputProps) {
  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          className={[
            "w-full rounded-md border bg-white text-sm py-2 pr-3 outline-none transition",
            "placeholder:text-gray-400",
            icon ? "pl-10" : "pl-3",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200",
            "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
