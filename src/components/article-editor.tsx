'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Sparkles, ArrowLeft, Wand2 } from 'lucide-react';
import type { Article, Category } from '@/lib/types';

export function ArticleEditor({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    summary: '',
    category_id: '',
    status: 'draft',
    is_top: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
      if (data.categories) setCategories(data.categories);
    });

    if (articleId) {
      fetch(`/api/articles/${articleId}`).then(r => r.json()).then(data => {
        if (data.article) {
          const a = data.article as Article;
          setForm({
            title: a.title,
            slug: a.slug,
            content: a.content,
            summary: a.summary || '',
            category_id: a.category_id,
            status: a.status,
            is_top: a.is_top,
          });
        }
      });
    }
  }, [articleId]);

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
  };

  const handleSave = async () => {
    if (!form.title || !form.content || !form.category_id) {
      alert('请填写标题、内容和分类');
      return;
    }
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    const slug = form.slug || generateSlug(form.title);
    const body = { ...form, slug, author: 'Admin' };

    try {
      const url = articleId ? `/api/articles/${articleId}` : '/api/articles';
      const method = articleId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/articles');
      } else {
        alert(data.error || '保存失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    setForm(prev => ({ ...prev, content: '' }));
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic: aiTopic }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setForm(prev => ({ ...prev, content: fullContent }));
              }
            } catch { /* skip */ }
          }
        }
      }

      if (!form.title && fullContent) {
        const titleMatch = fullContent.match(/^#\s+(.+)/);
        if (titleMatch) {
          setForm(prev => ({ ...prev, title: titleMatch[1].trim(), slug: generateSlug(titleMatch[1].trim()) }));
        }
      }
    } catch {
      alert('AI生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleAiPolish = async () => {
    if (!form.content.trim()) return;
    setPolishing(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: form.content }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setForm(prev => ({ ...prev, content: fullContent }));
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      alert('AI润色失败');
    } finally {
      setPolishing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/articles')} className="p-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{articleId ? '编辑文章' : '新建文章'}</h1>
      </div>

      {/* AI Generate Bar */}
      <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI 辅助写作</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiTopic}
            onChange={e => setAiTopic(e.target.value)}
            placeholder="输入文章主题，AI 将自动生成内容..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAiGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {generating ? '生成中...' : 'AI生成'}
          </button>
          <button
            onClick={handleAiPolish}
            disabled={polishing || !form.content}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 disabled:opacity-50"
          >
            {polishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {polishing ? '润色中...' : 'AI润色'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">标题 *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => {
                setForm(prev => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.slug || generateSlug(e.target.value),
                }));
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="文章标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">摘要</label>
            <textarea
              value={form.summary}
              onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="文章摘要（选填）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">正文内容 * (Markdown)</label>
            <textarea
              value={form.content}
              onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
              rows={20}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y leading-relaxed"
              placeholder="支持 Markdown 格式..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">分类 *</label>
            <select
              value={form.category_id}
              onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">选择分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">URL Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="url-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">状态</label>
            <select
              value={form.status}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_top"
              checked={form.is_top}
              onChange={e => setForm(prev => ({ ...prev, is_top: e.target.checked }))}
              className="rounded border-border"
            />
            <label htmlFor="is_top" className="text-sm">置顶文章</label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 mt-4"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? '保存中...' : '保存文章'}
          </button>
        </div>
      </div>
    </div>
  );
}
