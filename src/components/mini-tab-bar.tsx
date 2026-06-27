'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, FolderOpen, MessageSquare } from 'lucide-react';

const tabs = [
  { key: 'home', label: '首页', icon: Home, path: '/m' },
  { key: 'categories', label: '分类', icon: FolderOpen, path: '/m?tab=categories' },
  { key: 'messages', label: '留言', icon: MessageSquare, path: '/m?tab=messages' },
];

export function MiniTabBar({ activeTab }: { activeTab: string }) {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-foreground' : 'text-black/30'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* safe area for iPhone */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white" />
    </nav>
  );
}
