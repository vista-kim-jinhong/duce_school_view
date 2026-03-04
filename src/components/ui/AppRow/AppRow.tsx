import { HTMLAttributes } from "react";

// =================================================
// AppRow
// =================================================

type Align = "start" | "center" | "end" | "stretch";
type Justify = "start" | "center" | "end" | "between" | "around";
type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

interface AppRowProps extends HTMLAttributes<HTMLDivElement> {
  align?: Align;
  justify?: Justify;
  gap?: Gap;
  wrap?: boolean;
}

const alignStyles: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyStyles: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

const gapStyles: Record<Gap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

function AppRow({
  align = "stretch",
  justify = "start",
  gap = "md",
  wrap = false,
  children,
  className = "",
  ...props
}: AppRowProps) {
  return (
    <div
      className={[
        "flex",
        alignStyles[align],
        justifyStyles[justify],
        gapStyles[gap],
        wrap ? "flex-wrap" : "flex-nowrap",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

// =================================================
// AppRow.Cell
// =================================================

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | "auto" | "full";

interface AppRowCellProps extends HTMLAttributes<HTMLDivElement> {
  span?: ColSpan;
  shrink?: boolean;
}

const spanStyles: Record<string, string> = {
  1: "flex-[1]",
  2: "flex-[2]",
  3: "flex-[3]",
  4: "flex-[4]",
  5: "flex-[5]",
  6: "flex-[6]",
  auto: "flex-none",
  full: "w-full",
};

function AppRowCell({
  span = 1,
  shrink = false,
  children,
  className = "",
  ...props
}: AppRowCellProps) {
  return (
    <div
      className={[
        spanStyles[String(span)],
        shrink ? "flex-shrink" : "min-w-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

AppRow.Cell = AppRowCell;

export default AppRow;
