import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ミナミ工業 鉄骨技術伝承AIバイブル | 建築鉄骨製作・溶接品質管理',
  description: '建築鉄骨ファブリケーター工場向け、現場技術者の疑問とベテラン職長の暗黙知・JASS 6品質基準を音声対話で構造化・蓄積する技術伝承AIシステム。',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
