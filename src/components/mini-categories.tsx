'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FolderOpen, ChevronRight, FileText, Loader2 } from 'lucide-react';
import type { Category, Article } from '@/lib/types';

export function MiniCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/articles?public=true&page_size=100').then((r) => r.json()),
    ]).then(([catData, articleData]) => {
      if (catData.categories) setCategories(catData.categories);
      if (articleData.articles) setArticles(articleData.articles);
    }).finally(() => setLoading(false));
  }, []);

  const getArticleCount = (catId: string) =>
    articles.filter((a) => a.category_id === catId).length;

  const getCatArticles = (catId: string) =>
    articles.filter((a) => a.category_id === catId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-5 h-5 animate-spin text-black/30" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-4 pb-3 border-b border-black/5">
        <h1 className="text-lg font-bold tracking-tight">分类</h1>
        <p className="text-xs text-black/40 mt-0.5">
          共 {categories.length} 个分类，{articles.length} 篇文章
        </p>
      </div>

      <div className="divide-y divide-black/5">
        {categories.map((cat) => {
          const count = getArticleCount(cat.id);
          const isExpanded = expandedCat === cat.id;
          const catArticles = isExpanded ? getCatArticles(cat.id) : [];

          return (
            <div key={cat.id}>
              <button
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-black/[0.02] transition-colors"
              >
                <div className="w-9 h-9 border border-black/10 rounded flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-black/50" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium">{cat.name}</div>
                  {cat.description && (
                    <div className="text-[11px] text-black/35 mt-0.5 line-clamp-1">
                      {cat.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-black/30">{count} 篇</span>
                  <ChevronRight
                    className={`w-4 h-4 text-black/20 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="bg-black/[0.015]">
                  {catArticles.length === 0 ? (
                    <div className="px-4 py-4 text-xs text-black/25 text-center">
                      暂无文章
                    </div>
                  ) : (
                    catArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/m/article/${article.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 pl-10 border-t border-black/5 active:bg-black/[0.02]"
                      >
                        <FileText className="w-3.5 h-3.5 text-black/25 shrink-0" />
                        <span className="text-sm text-black/70 line-clamp-1">
                          {article.title}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
