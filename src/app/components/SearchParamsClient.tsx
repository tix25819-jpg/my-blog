'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CategoriesContent } from '@/components/categories-content';

function CategoriesWithParams() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('cat');
  return <CategoriesContent initialCategory={initialCategory} />;
}

function CategoriesParamsFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      <span className="ml-3 text-sm text-muted-foreground">加载分类...</span>
    </div>
  );
}

export function SearchParamsClient() {
  return (
    <Suspense fallback={<CategoriesParamsFallback />}>
      <CategoriesWithParams />
    </Suspense>
  );
}
