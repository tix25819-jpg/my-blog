'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { MiniTabBar } from '@/components/mini-tab-bar';
import { MiniHome } from '@/components/mini-home';
import { MiniCategories } from '@/components/mini-categories';
import { MiniMessages } from '@/components/mini-messages';

function MiniAppContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'home';

  const activeTab = ['home', 'categories', 'messages'].includes(tab) ? tab : 'home';

  return (
    <div className="min-h-screen bg-white">
      {/* Status bar spacer */}
      <div className="h-[env(safe-area-inset-top)]" />

      {/* Tab content */}
      <div className="pb-16">
        {activeTab === 'home' && <MiniHome />}
        {activeTab === 'categories' && <MiniCategories />}
        {activeTab === 'messages' && <MiniMessages />}
      </div>

      {/* Bottom tab bar */}
      <MiniTabBar activeTab={activeTab} />
    </div>
  );
}

function MiniAppFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
      <span className="ml-3 text-sm text-gray-500">加载中...</span>
    </div>
  );
}

export default function MiniAppPage() {
  return (
    <Suspense fallback={<MiniAppFallback />}>
      <MiniAppContent />
    </Suspense>
  );
}
