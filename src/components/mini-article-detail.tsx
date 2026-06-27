'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Eye, Send, CheckCircle, User, Mail, MessageSquare, Loader2 } from 'lucide-react';
import type { Article } from '@/lib/types';

export function MiniArticleDetail({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgForm, setMsgForm] = useState({ name: '', email: '', content: '' });
  const [msgSubmitting, setMsgSubmitting] = useState(false);
  const [msgSubmitted, setMsgSubmitted] = useState(false);
  const [msgError, setMsgError] = useState('');

  useEffect(() => {
    fetch(`/api/articles/${articleId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.article) {
          setArticle(data.article);
          fetch(`/api/articles/${articleId}/view`, { method: 'POST' }).catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleMsgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgForm.name || !msgForm.email || !msgForm.content) {
      setMsgError('请填写所有字段');
      return;
    }
    setMsgSubmitting(true);
    setMsgError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgForm),
      });
      const data = await res.json();
      if (data.success) {
        setMsgSubmitted(true);
        setMsgForm({ name: '', email: '', content: '' });
        setTimeout(() => setMsgSubmitted(false), 3000);
      } else {
        setMsgError(data.error || '提交失败');
      }
    } catch {
      setMsgError('网络错误');
    } finally {
      setMsgSubmitting(false);
    }
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-3" />;
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold mt-4 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-5 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm text-black/70">{line.slice(2)}</li>;
      if (line.startsWith('```')) return null;
      const codeMatch = line.match(/`([^`]+)`/g);
      if (codeMatch) {
        let rendered = line;
        codeMatch.forEach((m) => {
          const inner = m.slice(1, -1);
          rendered = rendered.replace(m, `<code class="px-1 py-0.5 bg-black/[0.04] text-xs rounded font-mono">${inner}</code>`);
        });
        return <p key={i} className="text-sm text-black/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered }} />;
      }
      return <p key={i} className="text-sm text-black/70 leading-relaxed">{line}</p>;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-5 h-5 animate-spin text-black/30" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-20 text-center text-black/30 text-sm">
        文章不存在
        <button onClick={() => router.push('/m')} className="block mx-auto mt-3 text-xs border border-foreground px-4 py-1.5 rounded">
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-black/5 flex items-center gap-3 px-3 h-11">
        <button onClick={() => router.push('/m')} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium truncate">{article.title}</span>
      </div>

      {/* Article content */}
      <div className="px-4 pt-4 pb-6">
        {/* Cover */}
        {article.cover_image && (
          <div className="mb-4 rounded overflow-hidden border border-black/5">
            <img src={article.cover_image} alt={article.title} className="w-full" />
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl font-bold leading-tight">{article.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2 mb-5 text-[11px] text-black/35">
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
            {article.view_count} 阅读
          </span>
          <span>{article.author}</span>
        </div>

        {/* Body */}
        <div className="article-body">{renderContent(article.content)}</div>
      </div>

      {/* Divider */}
      <div className="border-t-4 border-black/[0.03]" />

      {/* Message form */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4" />
          留言
        </h2>

        {msgSubmitted && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-black/[0.03] border border-black/10 rounded text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-black/50" />
            <span>留言已提交，等待审核</span>
          </div>
        )}

        <form onSubmit={handleMsgSubmit} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/25" />
              <input
                type="text"
                value={msgForm.name}
                onChange={(e) => setMsgForm({ ...msgForm, name: e.target.value })}
                placeholder="姓名"
                className="w-full pl-8 pr-3 py-2 text-xs border border-black/10 rounded focus:border-foreground focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/25" />
              <input
                type="email"
                value={msgForm.email}
                onChange={(e) => setMsgForm({ ...msgForm, email: e.target.value })}
                placeholder="邮箱"
                className="w-full pl-8 pr-3 py-2 text-xs border border-black/10 rounded focus:border-foreground focus:outline-none transition-colors"
              />
            </div>
          </div>
          <textarea
            value={msgForm.content}
            onChange={(e) => setMsgForm({ ...msgForm, content: e.target.value })}
            placeholder="写下你的想法..."
            rows={3}
            className="w-full px-3 py-2 text-xs border border-black/10 rounded focus:border-foreground focus:outline-none transition-colors resize-none"
          />
          {msgError && <p className="text-[11px] text-red-500">{msgError}</p>}
          <button
            type="submit"
            disabled={msgSubmitting}
            className="w-full py-2 text-xs border border-foreground text-foreground rounded hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
          >
            {msgSubmitting ? '提交中...' : '提交留言'}
          </button>
        </form>
      </div>
    </div>
  );
}
