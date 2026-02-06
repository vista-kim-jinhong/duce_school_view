import "./globals.css";
import LayoutHeader from "./_layout/LayoutHeader";
import LayoutFooter from "./_layout/LayoutFooter";

export const metadata = {
  title: "DUCE School View",
  description: "DUCE 学校向け管理画面",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <LayoutHeader />
        <main className="min-h-screen bg-gray-50 py-6">{children}</main>
        <LayoutFooter />
      </body>
    </html>
  );
}
