'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Github, Mail } from 'lucide-react';

type SiteConfig = Record<string, string>;

export function BlogFooter() {
  const [config, setConfig] = useState<SiteConfig>({});

  useEffect(() => {
    fetch('/api/site-config')
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
      })
      .catch(() => {});
  }, []);

  const siteName = config.site_name || 'CodePilot';
  const siteDesc = config.site_description || 'AI辅助编程选题博客，探索编程世界的无限可能。';
  const contactEmail = config.contact_email || 'hello@codepilot.dev';
  const githubUrl = config.site_github || 'https://github.com';
  const footerCopyright = config.footer_copyright || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold mb-4">{siteName}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {siteDesc}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">快速链接</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">首页</Link>
              <Link href="/categories" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">分类</Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">关于</Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">联系</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">联系我</h3>
            <div className="space-y-2">
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-3.5 w-3.5" /> {contactEmail}
              </a>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {footerCopyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
