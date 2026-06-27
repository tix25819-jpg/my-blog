'use client';

import { MiniArticleDetail } from '@/components/mini-article-detail';

export default function MiniArticlePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[env(safe-area-inset-top)]" />
      <MiniArticleDetailWrapper params={params} />
    </div>
  );
}

function MiniArticleDetailWrapper({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use to unwrap the params promise (Next.js 15+)
  const { id } = React.use(params);
  return <MiniArticleDetail articleId={id} />;
}

import React from 'react';
