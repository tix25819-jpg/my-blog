'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Lightbulb, Copy, Check, Zap, FileText, ChevronDown } from 'lucide-react';

interface TopicSuggestion {
  title: string;
  description: string;
  difficulty: string;
}

interface AutoPublishResult {
  id: string;
  title: string;
  slug: string;
  summary: string;
  status: string;
  created_at: string;
}

export function AiAssistant() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'auto' | 'topic' | 'generate' | 'polish'>('auto');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Auto publish state
  const [autoCategory, setAutoCategory] = useState('');
  const [autoTopic, setAutoTopic] = useState('');
  const [autoStyle, setAutoStyle] = useState('');
  const [autoResult, setAutoResult] = useState<AutoPublishResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Topic state
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState<TopicSuggestion[]>([]);

  // Generate state
  const [genInput, setGenInput] = useState('');
  const [genOutput, setGenOutput] = useState('');

  // Polish state
  const [polishInput, setPolishInput] = useState('');
  const [polishOutput, setPolishOutput] = useState('');

  const categories = [
    { id: '', label: '随机分类' },
    { id: 'e8eae8ee-18f4-487f-867b-56f8d90c1dc6', label: '前端开发' },
    { id: '965f16f6-b071-46d8-965a-9d332439516d', label: '后端开发' },
    { id: '82e32c64-258f-4351-af79-a6bcc5874c9e', label: 'AI与编程' },
    { id: 'b3f3519a-fef6-435f-a0da-52f19e6364a0', label: 'DevOps' },
    { id: '8b67ca2d-db1b-42e3-bab4-f811288b0e64', label: '编程思维' },
  ];

  const handleAutoPublish = async () => {
    setLoading(true);
    setAutoResult(null);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/ai/auto-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          category: autoCategory || undefined,
          topic: autoTopic || undefined,
          style: autoStyle || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAutoResult(data.article);
      } else {
        alert(data.error || '自动发布失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSuggest = async () => {
    if (!topicInput.trim()) return;
    setLoading(true);
    setTopics([]);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/ai/topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ field: topicInput, count: 5 }),
      });
      const data = await res.json();
      if (data.topics) setTopics(data.topics);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!genInput.trim()) return;
    setLoading(true);
    setGenOutput('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic: genInput }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        chunk.split('\n').forEach(line => {
          if (line.startsWith('data: ')) {
            const d = line.slice(6);
            if (d === '[DONE]') return;
            try {
              const parsed = JSON.parse(d);
              if (parsed.content) setGenOutput(prev => prev + parsed.content);
            } catch { /* skip */ }
          }
        });
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handlePolish = async () => {
    if (!polishInput.trim()) return;
    setLoading(true);
    setPolishOutput('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/ai/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: polishInput }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        chunk.split('\n').forEach(line => {
          if (line.startsWith('data: ')) {
            const d = line.slice(6);
            if (d === '[DONE]') return;
            try {
              const parsed = JSON.parse(d);
              if (parsed.content) setPolishOutput(prev => prev + parsed.content);
            } catch { /* skip */ }
          }
        });
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs = [
    { key: 'auto' as const, label: '一键发文', icon: Zap },
    { key: 'topic' as const, label: '选题推荐', icon: Lightbulb },
    { key: 'generate' as const, label: '文章生成', icon: Sparkles },
    { key: 'polish' as const, label: '内容润色', icon: Check },
  ];

  const btnBase = 'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all';
  const btnOutline = `${btnBase} border border-border hover:border-foreground hover:bg-foreground hover:text-background`;
  const btnPrimary = `${btnBase} border border-foreground bg-foreground text-background hover:bg-background hover:text-foreground`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6" />
        <h1 className="text-2xl font-bold">AI 助手</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={activeTab === tab.key ? btnPrimary : btnOutline}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== Auto Publish ===== */}
      {activeTab === 'auto' && (
        <div>
          <div className="p-6 border border-border rounded-lg mb-6">
            <h2 className="text-lg font-bold mb-1">一键 AI 自动发文</h2>
            <p className="text-sm text-muted-foreground mb-5">
              AI 自动选题、生成文章内容、提取标题摘要、发布到博客。不填主题则 AI 随机选题。
            </p>

            {/* 主题输入 */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={autoTopic}
                onChange={e => setAutoTopic(e.target.value)}
                placeholder="输入文章主题（留空则 AI 自动选题）"
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-foreground"
                onKeyDown={e => e.key === 'Enter' && handleAutoPublish()}
              />
              <button
                onClick={handleAutoPublish}
                disabled={loading}
                className={btnPrimary + ' disabled:opacity-40 shrink-0'}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {loading ? '生成中...' : '一键发文'}
              </button>
            </div>

            {/* 分类选择 */}
            <div className="flex gap-2 items-center mb-3">
              <span className="text-sm text-muted-foreground shrink-0">分类：</span>
              <div className="flex gap-1.5 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setAutoCategory(cat.id)}
                    className={`px-3 py-1 rounded text-xs border transition-all ${
                      autoCategory === cat.id
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 高级选项 */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              高级选项
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">写作风格</label>
                  <input
                    type="text"
                    value={autoStyle}
                    onChange={e => setAutoStyle(e.target.value)}
                    placeholder="如：幽默风趣、学术严谨、实战导向..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 发布结果 */}
          {autoResult && (
            <div className="p-5 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
                <span className="font-bold">发布成功</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{autoResult.title}</h3>
              {autoResult.summary && (
                <p className="text-sm text-muted-foreground mb-3">{autoResult.summary}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 border border-border rounded">已发布</span>
                <span>{new Date(autoResult.created_at).toLocaleString('zh-CN')}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => router.push(`/article/${autoResult.id}`)}
                  className={btnOutline + ' text-xs'}
                >
                  <FileText className="h-3.5 w-3.5" /> 查看文章
                </button>
                <button
                  onClick={() => router.push(`/admin/articles/${autoResult.id}/edit`)}
                  className={btnOutline + ' text-xs'}
                >
                  编辑文章
                </button>
                <button
                  onClick={() => { setAutoResult(null); setAutoTopic(''); }}
                  className={btnOutline + ' text-xs'}
                >
                  再发一篇
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Topic Suggestion ===== */}
      {activeTab === 'topic' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              placeholder="输入编程领域，如：前端开发、Python爬虫、AI编程..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-foreground"
              onKeyDown={e => e.key === 'Enter' && handleTopicSuggest()}
            />
            <button
              onClick={handleTopicSuggest}
              disabled={loading}
              className={btnPrimary + ' disabled:opacity-40'}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
              获取选题
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic, i) => (
              <div key={i} className="p-4 rounded-lg border border-border hover:border-foreground/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-sm mb-1">{topic.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{topic.description}</p>
                    <span className="inline-block px-2 py-0.5 rounded text-xs border border-border">{topic.difficulty}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleCopy(topic.title, `topic-${i}`);
                      setGenInput(topic.title);
                      setActiveTab('generate');
                    }}
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground shrink-0"
                    title="用此选题生成文章"
                  >
                    {copied === `topic-${i}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Article Generation ===== */}
      {activeTab === 'generate' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={genInput}
              onChange={e => setGenInput(e.target.value)}
              placeholder="输入文章主题，如：React 19 新特性解析"
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-foreground"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={btnPrimary + ' disabled:opacity-40'}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              生成文章
            </button>
          </div>

          {genOutput && (
            <div className="relative">
              <button
                onClick={() => handleCopy(genOutput, 'gen')}
                className="absolute top-3 right-3 p-1.5 rounded text-muted-foreground hover:text-foreground z-10"
              >
                {copied === 'gen' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <div className="p-4 rounded-lg border border-border bg-background prose prose-sm max-w-none whitespace-pre-wrap">
                {genOutput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Content Polish ===== */}
      {activeTab === 'polish' && (
        <div>
          <div className="mb-4">
            <textarea
              value={polishInput}
              onChange={e => setPolishInput(e.target.value)}
              rows={6}
              placeholder="粘贴需要润色的文章内容..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-foreground resize-none"
            />
            <button
              onClick={handlePolish}
              disabled={loading || !polishInput.trim()}
              className={`mt-2 ${btnPrimary} disabled:opacity-40`}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              AI润色
            </button>
          </div>

          {polishOutput && (
            <div className="relative">
              <button
                onClick={() => handleCopy(polishOutput, 'polish')}
                className="absolute top-3 right-3 p-1.5 rounded text-muted-foreground hover:text-foreground z-10"
              >
                {copied === 'polish' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <div className="p-4 rounded-lg border border-border bg-background prose prose-sm max-w-none whitespace-pre-wrap">
                {polishOutput}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
