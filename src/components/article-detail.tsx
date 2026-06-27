'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Eye, Tag, ArrowLeft, ArrowRight, Loader2, Send, CheckCircle, User, Mail, MessageSquare } from 'lucide-react';
import type { Article } from '@/lib/types';

export function ArticleDetail({ articleId }: { articleId: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgForm, setMsgForm] = useState({ name: '', email: '', content: '' });
  const [msgSubmitting, setMsgSubmitting] = useState(false);
  const [msgSubmitted, setMsgSubmitted] = useState(false);
  const [msgError, setMsgError] = useState('');

  useEffect(() => {
    fetch(`/api/articles/${articleId}`)
      .then(r => r.json())
      .then(data => {
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
      setMsgError('请填写所有必填字段');
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
      } else {
        setMsgError(data.error || '提交失败');
      }
    } catch {
      setMsgError('网络错误，请稍后重试');
    } finally {
      setMsgSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-32 text-center">
        <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors">
          <ArrowLeft className="h-4 w-4" /> 返回首页
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8 md:py-16">
      {/* 返回链接 */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> 返回首页
      </Link>

      {/* 封面图 */}
      {article.cover_image && (
        <div className="mb-8 rounded-md overflow-hidden border border-border">
          <img src={article.cover_image} alt={article.title} className="w-full object-cover" />
        </div>
      )}

      {/* 文章头部 */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {article.categories && (
            <Link href={`/categories?cat=${article.categories.id}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors">
              <Tag className="h-3 w-3" /> {article.categories.name}
            </Link>
          )}
          {article.is_top && (
            <span className="px-3 py-1 rounded-md text-xs font-medium border border-foreground bg-foreground text-background">置顶</span>
          )}
        </div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">{article.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{article.view_count} 次阅读</span>
          <span>作者: {article.author}</span>
        </div>
      </header>

      {/* 文章正文 */}
      <div className="prose-custom">
        <div
          className="article-content text-foreground/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />
      </div>

      {/* 底部导航 */}
      <div className="mt-12 pt-8 border-t border-border">
        <div className="flex flex-wrap gap-3">
          {article.categories && (
            <Link href={`/categories?cat=${article.categories.id}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors">
              更多 {article.categories.name} 文章 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground transition-colors">
            留言讨论
          </Link>
        </div>
      </div>

      {/* 留言提交框 */}
      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="text-lg font-bold mb-6">留言</h2>

        {msgSubmitted ? (
          <div className="text-center py-12 rounded-md border border-border">
            <CheckCircle className="h-10 w-10 text-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">留言已提交</p>
            <p className="text-sm text-muted-foreground mb-4">感谢你的留言，审核后将展示</p>
            <button
              onClick={() => setMsgSubmitted(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              继续留言
            </button>
          </div>
        ) : (
          <form onSubmit={handleMsgSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> 姓名 *</span>
                </label>
                <input
                  type="text"
                  value={msgForm.name}
                  onChange={(e) => setMsgForm({ ...msgForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                  placeholder="你的姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> 邮箱 *</span>
                </label>
                <input
                  type="email"
                  value={msgForm.email}
                  onChange={(e) => setMsgForm({ ...msgForm, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> 留言内容 *</span>
              </label>
              <textarea
                value={msgForm.content}
                onChange={(e) => setMsgForm({ ...msgForm, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
                placeholder="写下你的想法..."
              />
            </div>
            {msgError && <p className="text-sm text-red-500">{msgError}</p>}
            <button
              type="submit"
              disabled={msgSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-foreground text-sm font-medium hover:bg-foreground hover:text-background disabled:opacity-50 transition-colors"
            >
              {msgSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {msgSubmitting ? '提交中...' : '提交留言'}
            </button>
          </form>
        )}
      </section>
    </article>
  );
}

function renderMarkdown(content: string): string {
  let html = content;
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-8 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-10 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-12 mb-5">$1</h1>');
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted border border-border rounded-md p-4 overflow-x-auto my-4"><code class="text-sm font-mono text-foreground/80">$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded border border-border text-sm font-mono">$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline underline-offset-2 hover:text-muted-foreground transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-foreground/80">$1</li>');
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-foreground pl-4 my-4 text-muted-foreground italic">$1</blockquote>');
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}
