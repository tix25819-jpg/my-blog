import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Folder, FileText, Loader2, Calendar, Eye } from 'lucide-react';
import type { Category, Article } from '@/lib/types';

interface CategoriesContentProps {
  initialCategory?: string | null;
}

export function CategoriesContent({ initialCategory = null }: CategoriesContentProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/articles?public=true&page_size=100').then(r => r.json()),
    ]).then(([catData, articleData]) => {
      if (catData.categories) setCategories(catData.categories);
      if (articleData.articles) setArticles(articleData.articles);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    );
  }

  const getCategoryCount = (catId: string) => articles.filter(a => a.category_id === catId).length;
  const filteredArticles = selectedCategory ? articles.filter(a => a.category_id === selectedCategory) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-20">
      {/* 页头 */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">文章分类</h1>
        <p className="text-muted-foreground">按技术领域浏览文章</p>
      </div>

      {/* 顶部分类筛选栏 */}
      <div className="flex flex-wrap gap-2 mb-10">
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
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
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

      {/* 分类卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`text-left p-6 rounded-md border transition-colors ${
              selectedCategory === cat.id
                ? 'border-foreground'
                : 'border-border bg-card hover:border-foreground/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-md border ${
                selectedCategory === cat.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground'
              }`}>
                <Folder className="h-4 w-4" />
              </div>
              <h3 className="font-semibold">{cat.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" /> {getCategoryCount(cat.id)} 篇文章
            </div>
          </button>
        ))}
      </div>

      {/* 选中分类的文章列表 */}
      {selectedCategory && (
        <div>
          <h2 className="text-xl font-bold mb-6">
            {categories.find(c => c.id === selectedCategory)?.name} 文章列表
          </h2>
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-1">该分类暂无文章</p>
              <p className="text-sm">去管理后台发布第一篇吧</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map(article => (
                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  className="group flex items-start justify-between gap-4 p-4 rounded-md border border-border hover:border-foreground/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:underline underline-offset-4 decoration-foreground/30 mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{article.summary}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 pt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.view_count}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
