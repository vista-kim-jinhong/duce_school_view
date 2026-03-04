import { LabelHTMLAttributes } from "react";

interface AppLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export default function AppLabel({
  required = false,
  children,
  className = "",
  ...props
}: AppLabelProps) {
  return (
    <label
      className={["block text-xs font-medium text-gray-600 mb-1", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}
