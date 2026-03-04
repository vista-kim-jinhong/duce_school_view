import { HTMLAttributes } from "react";

type Padding = "none" | "sm" | "md" | "lg";

interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  center?: boolean;
}

const paddingStyles: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function AppCard({
  padding = "md",
  center = false,
  children,
  className = "",
  ...props
}: AppCardProps) {
  const card = (
    <div
      className={[
        "rounded-xl bg-white/80 backdrop-blur-md shadow-lg border border-gray-200",
        paddingStyles[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );

  if (center) {
    return (
      <div className="flex items-center justify-center flex-1">{card}</div>
    );
  }

  return card;
}
