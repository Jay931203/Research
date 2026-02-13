import type { Metadata } from 'next';
import { JetBrains_Mono, Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/common/ThemeProvider';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CSI Research Graph',
  description:
    'CSI AutoEncoder 관련 논문의 핵심을 빠르게 리마인드하고, 연계 관계를 시각적으로 탐색하는 연구 워크스페이스',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansKr.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

