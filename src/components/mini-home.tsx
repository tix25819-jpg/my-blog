'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Eye, ChevronRight, Loader2 } from 'lucide-react';
import type { Article, Category } from '@/lib/types';

export function MiniHome() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('');
  const [siteDesc, setSiteDesc] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/articles?public=true&page_size=50').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/site-config').then((r) => r.json()),
    ]).then(([articleData, catData, configData]) => {
      if (articleData.articles) setArticles(articleData.articles);
      if (catData.categories) setCategories(catData.categories);
      if (configData.config) {
        setSiteName(configData.config.site_name || '');
        setSiteDesc(configData.config.site_description || '');
      }
    }).finally(() => setLoading(false));
  }, []);

  const filtered = selectedCat
    ? articles.filter((a) => a.category_id === selectedCat)
    : articles;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-5 h-5 animate-spin text-black/30" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-black/5">
        <h1 className="text-lg font-bold tracking-tight">{siteName || 'Lumen'}</h1>
        <p className="text-xs text-black/40 mt-0.5">{siteDesc}</p>
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCat(null)}
            className={`shrink-0 px-3 py-1 text-xs rounded-full border transition-colors ${
              !selectedCat
                ? 'bg-foreground text-background border-foreground'
                : 'bg-white text-black/60 border-black/15'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`shrink-0 px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedCat === cat.id
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-white text-black/60 border-black/15'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Article list */}
      <div className="divide-y divide-black/5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-black/30 text-sm">暂无文章</div>
        ) : (
          filtered.map((article) => (
            <Link
              key={article.id}
              href={`/m/article/${article.id}`}
              className="flex items-start gap-3 px-4 py-3 active:bg-black/[0.02] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium leading-snug line-clamp-2">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-black/35">
                  {article.categories && (
                    <span className="border border-black/10 px-1.5 py-0.5 rounded text-[10px]">
                      {article.categories.name}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(article.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {article.view_count}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-black/20 mt-1 shrink-0" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
