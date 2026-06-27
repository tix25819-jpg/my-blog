'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Eye, ArrowRight, Tag, Loader2 } from 'lucide-react';
import type { Article, Category } from '@/lib/types';

export function HomeContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('');
  const [siteDesc, setSiteDesc] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/articles?public=true&page_size=20').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/site-config').then(r => r.json()),
    ]).then(([articleData, categoryData, configData]) => {
      if (articleData.articles) setArticles(articleData.articles);
      if (categoryData.categories) setCategories(categoryData.categories);
      if (configData.config) {
        setSiteName(configData.config.site_name || '');
        setSiteDesc(configData.config.site_description || '');
      }
    }).finally(() => setLoading(false));
  }, []);

  const filteredArticles = selectedCategory
    ? articles.filter(a => a.category_id === selectedCategory)
    : articles;

  const topArticles = articles.filter(a => a.is_top);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero — 纯白底黑字，无渐变 */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
              {siteName ? `${siteName} Blog` : 'AI-Powered Blog'}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              探索编程世界的
              <br />
              无限可能
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-8">
              {siteDesc || 'AI辅助编程选题博客，汇集前沿技术文章、编程选题推荐和技术思考。让每一次编码都有方向，让每一行代码都有意义。'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                浏览文章 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Articles — 白底卡片 */}
      {topArticles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            置顶推荐
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topArticles.map(article => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="group block rounded-md border border-border bg-card p-6 hover:border-foreground/30 transition-colors"
              >
                <h3 className="text-lg font-semibold group-hover:underline underline-offset-4 decoration-foreground/30 mb-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.summary}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.view_count}</span>
                  {article.categories && (
                    <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{article.categories.name}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Categories Filter — 线框标签 */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              !selectedCategory
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                selectedCategory === cat.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Article List — 白底卡片 + 线框 */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          最新文章
        </h2>
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">暂无文章</p>
            <p className="text-sm">去管理后台发布第一篇文章吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map(article => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="group block rounded-md border border-border bg-card overflow-hidden hover:border-foreground/30 transition-colors"
              >
                {article.cover_image && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {article.categories && (
                      <span className="px-2 py-0.5 rounded text-xs border border-border text-muted-foreground">{article.categories.name}</span>
                    )}
                    {article.is_top && (
                      <span className="px-2 py-0.5 rounded text-xs border border-border text-muted-foreground">置顶</span>
                    )}
                  </div>
                  <h3 className="font-semibold group-hover:underline underline-offset-4 decoration-foreground/30 mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{article.summary}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.view_count}</span>
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      阅读 <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
