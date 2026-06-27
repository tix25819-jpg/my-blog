import { Suspense } from 'react';
import { BlogNav } from '@/components/blog-nav';
import { BlogFooter } from '@/components/blog-footer';
import { SearchParamsClient } from '../components/SearchParamsClient';

function CategoriesFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      <span className="ml-3 text-sm text-muted-foreground">加载分类...</span>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BlogNav />
      <main className="flex-1">
        <Suspense fallback={<CategoriesFallback />}>
          <SearchParamsClient />
        </Suspense>
      </main>
      <BlogFooter />
    </div>
  );
}
