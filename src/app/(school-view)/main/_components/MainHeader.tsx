"use client";

import AppRow from "@/components/ui/AppRow/AppRow";

// 外部リンク
const MAIN_LINKS = [
  {
    label: "新規のご依頼・ご相談はこちら",
    url: "https://form.kintoneapp.com/public/form/show/b2c8a86bdfb331106245b1606bd4a2771cdd758ec44e098a094109c0e9da339a#/",
    remarks: "",
    variant: "primary",
  },
  {
    label: "消耗品の発注状況はこちら",
    url: "https://viewer.kintoneapp.com/public/6528c71fcc2af4db6ced7b4e6de30522551674bc49972472ef423ad8f459d41e",
    remarks: "※ 要ID:パスワード",
    variant: "secondary",
  },
  {
    label: "消耗品のご発注はこちら",
    url: "https://form.kintoneapp.com/public/form/show/2dbebd821c5108c8bee2549b834582696fd0550f7da2ecfd17b9e4b68aaf9f40",
    remarks: "※ 要ID:パスワード",
    variant: "success",
  },
] as const;

const variantStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-500 hover:bg-gray-600 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
} as const;

interface MainHeaderProps {
  schoolOrCompanyName: string;
}

/**
 * Client-Side-Component: Main Header
 * @description 学校名表示 + 外部リンクボタン3つ
 * @returns JSX.Element
 */
export default function MainHeader({ schoolOrCompanyName }: MainHeaderProps) {
  return (
    <div className="mb-4 space-y-3">
      {/* 学校名 */}
      <h3 className="text-xl font-bold text-gray-800">{schoolOrCompanyName}</h3>

      {/* 外部リンクボタン */}
      <AppRow gap="sm" wrap>
        {MAIN_LINKS.map((link) => (
          <AppRow.Cell key={link.label} span="auto">
            <div className="flex flex-col gap-1">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "inline-block rounded px-4 py-2 text-sm font-medium transition-colors",
                  variantStyles[link.variant],
                ].join(" ")}
              >
                {link.label}
              </a>
              {link.remarks && (
                <span className="text-xs text-gray-500">{link.remarks}</span>
              )}
            </div>
          </AppRow.Cell>
        ))}
      </AppRow>
    </div>
  );
}
