'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Loader2, Search } from 'lucide-react';
import type { Article, Category } from '@/lib/types';

export function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchArticles = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`/api/articles?page=${page}&page_size=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.articles) {
      setArticles(data.articles);
      setTotal(data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
      if (data.categories) setCategories(data.categories);
    });
    fetchArticles();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该文章？')) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchArticles();
  };

  const filteredArticles = searchTerm
    ? articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : articles;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link href="/admin/articles/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" /> 新建文章
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜索文章..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                <th className="text-left px-4 py-3 font-medium">标题</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">分类</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">阅读量</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">创建时间</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map(article => (
                <tr key={article.id} className="border-b border-border hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {article.is_top && <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">顶</span>}
                      <span className="font-medium truncate max-w-[200px]">{article.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {article.categories?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      article.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{article.view_count}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{new Date(article.created_at).toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/article/${article.id}`} className="p-1.5 rounded text-muted-foreground hover:text-foreground" title="查看">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/articles/${article.id}/edit`} className="p-1.5 rounded text-muted-foreground hover:text-primary" title="编辑">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded text-muted-foreground hover:text-red-400" title="删除">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredArticles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">暂无文章</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > 10 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded border border-border text-sm disabled:opacity-50 hover:bg-accent"
          >
            上一页
          </button>
          <span className="text-sm text-muted-foreground">第 {page} 页</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 10 >= total}
            className="px-3 py-1.5 rounded border border-border text-sm disabled:opacity-50 hover:bg-accent"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
