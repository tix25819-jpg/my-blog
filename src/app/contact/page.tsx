'use client';

import { useState, useEffect } from 'react';
import { BlogNav } from '@/components/blog-nav';
import { BlogFooter } from '@/components/blog-footer';
import { Send, CheckCircle, Loader2, Mail, User, MessageSquare, Github } from 'lucide-react';

type SiteConfig = Record<string, string>;

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<SiteConfig>({});

  useEffect(() => {
    fetch('/api/site-config')
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
      })
      .catch(() => {});
  }, []);

  const contactInfo = config.contact_info || '邮箱：hello@codepilot.dev\nGitHub：https://github.com';
  const contactEmail = config.contact_email || '';
  const githubUrl = config.site_github || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      setError('请填写所有必填字段');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', content: '' });
      } else {
        setError(data.error || '提交失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <BlogNav />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-20">
          <h1 className="text-3xl font-bold mb-2">联系我</h1>
          <p className="text-muted-foreground mb-10">有任何问题或建议，欢迎留言</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* 左侧 - 联系信息 */}
            <div className="md:col-span-2 space-y-4">
              {/* 联系方式卡片 */}
              <div className="p-6 rounded-md border border-border">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">联系方式</h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mb-6">
                  {contactInfo}
                </div>

                {/* 快捷链接 */}
                <div className="space-y-2">
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-md border border-border text-sm hover:border-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{contactEmail}</span>
                    </a>
                  )}
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-md border border-border text-sm hover:border-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-4 w-4 shrink-0" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧 - 留言表单 */}
            <div className="md:col-span-3">
              {submitted ? (
                <div className="text-center py-16 rounded-md border border-border">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3" />
                  <h2 className="text-lg font-bold mb-1">留言已提交</h2>
                  <p className="text-sm text-muted-foreground mb-6">感谢你的留言，审核后将展示</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
                  >
                    继续留言
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> 姓名 *</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
                      placeholder="写下你的留言..."
                    />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-foreground text-sm font-medium hover:bg-foreground hover:text-background disabled:opacity-50 transition-colors"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {submitting ? '提交中...' : '提交留言'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
