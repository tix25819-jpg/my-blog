import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodePilot - AI辅助编程选题博客',
  description: '探索编程世界的无限可能 - AI辅助编程、技术博客、选题推荐',
  keywords: '编程,AI,前端,后端,DevOps,选题,CodePilot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
