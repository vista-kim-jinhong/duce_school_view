import "./globals.css";
import LayoutHeader from "./_layout/LayoutHeader";
import LayoutFooter from "./_layout/LayoutFooter";

import { getSessionCookie } from "@/lib/cookie/session";
import JotaiProviders from "@/components/JotaiProviders";

export const metadata = {
  title: "DUCE School View",
  description: "DUCE 学校向け管理画面",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionCookie();

  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen">
        <JotaiProviders initialSession={session}>
          <LayoutHeader />
          <main className="flex flex-1 flex-col bg-gray-50">{children}</main>
          <LayoutFooter />
        </JotaiProviders>
      </body>
    </html>
  );
}
