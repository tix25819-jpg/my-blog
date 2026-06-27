'use client';

import { useState, useEffect } from 'react';
import { FileText, FolderOpen, MessageSquare, Eye, Clock, AlertCircle, Loader2 } from 'lucide-react';
import type { DashboardStats } from '@/lib/types';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
        else setError(data.error || '加载失败');
      })
      .catch(() => setError('网络错误'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 flex items-center justify-center gap-2">
        <AlertCircle className="h-5 w-5" /> {error}
      </div>
    );
  }

  const statCards = [
    { label: '文章总数', value: stats?.totalArticles || 0, icon: FileText, color: 'text-blue-400' },
    { label: '已发布', value: stats?.publishedArticles || 0, icon: FileText, color: 'text-green-400' },
    { label: '分类数', value: stats?.totalCategories || 0, icon: FolderOpen, color: 'text-purple-400' },
    { label: '留言数', value: stats?.totalMessages || 0, icon: MessageSquare, color: 'text-cyan-400' },
    { label: '待审核', value: stats?.pendingMessages || 0, icon: AlertCircle, color: 'text-amber-400' },
    { label: '总阅读', value: stats?.totalViews || 0, icon: Eye, color: 'text-pink-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">数据看板</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${card.color}`} />
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> 最近文章
          </h2>
          {(stats?.recentArticles || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无文章</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentArticles.map(article => (
                <div key={article.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {article.categories?.name || '未分类'} · {new Date(article.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <span className={`ml-3 px-2 py-0.5 rounded text-xs ${
                    article.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {article.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> 最近留言
          </h2>
          {(stats?.recentMessages || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无留言</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentMessages.map(msg => (
                <div key={msg.id} className="p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{msg.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      msg.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
                    }`}>
                      {msg.status === 'pending' ? '待审核' : msg.status === 'approved' ? '已通过' : '已拒绝'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{msg.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
