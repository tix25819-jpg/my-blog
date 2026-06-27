'use client';

import { useState, useEffect } from 'react';
import { BlogNav } from '@/components/blog-nav';
import { BlogFooter } from '@/components/blog-footer';
import { Loader2 } from 'lucide-react';

type SiteConfig = Record<string, string>;

export default function AboutPage() {
  const [config, setConfig] = useState<SiteConfig>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/site-config')
      .then(r => r.json())
      .then(data => {
        if (data.config) setConfig(data.config);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <BlogNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-foreground" />
        </main>
        <BlogFooter />
      </div>
    );
  }

  const siteName = config.site_name || 'Lumen';
  const siteAuthor = config.site_author || '';
  const aboutContent = config.about_content || '暂无简介内容，请在后台配置中填写「关于我」信息。';
  const initials = siteName.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      <BlogNav />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-20">
          <h1 className="text-3xl font-bold mb-8">关于我</h1>

          <div className="space-y-8">
            {/* 个人信息 */}
            <section className="rounded-md border border-border p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-md border border-foreground bg-foreground text-background flex items-center justify-center text-lg font-bold">
                  {initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{siteAuthor || siteName}</h2>
                  <p className="text-sm text-muted-foreground">全栈开发者 / AI编程爱好者</p>
                </div>
              </div>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {aboutContent}
              </div>
            </section>

            {/* 技术栈 */}
            <section>
              <h2 className="text-lg font-bold mb-4">技术栈</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: 'Next.js', desc: '全栈框架' },
                  { name: 'React', desc: 'UI库' },
                  { name: 'TypeScript', desc: '类型安全' },
                  { name: 'Node.js', desc: '后端运行时' },
                  { name: 'Supabase', desc: 'BaaS平台' },
                  { name: 'AI/LLM', desc: '大语言模型' },
                ].map(tech => (
                  <div key={tech.name} className="p-4 rounded-md border border-border">
                    <div className="font-medium text-sm">{tech.name}</div>
                    <div className="text-xs text-muted-foreground">{tech.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 项目理念 */}
            <section>
              <h2 className="text-lg font-bold mb-4">项目理念</h2>
              <div className="space-y-3">
                {[
                  { title: 'AI辅助', desc: '利用大语言模型提升内容创作和编程效率' },
                  { title: '选题驱动', desc: '以实际编程项目为选题，学以致用' },
                  { title: '开源精神', desc: '分享知识，共同成长' },
                ].map(item => (
                  <div key={item.title} className="p-4 rounded-md border border-border">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
