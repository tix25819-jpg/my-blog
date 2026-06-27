'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle, User, Mail, MessageSquare, Clock, Loader2 } from 'lucide-react';
import type { Message } from '@/lib/types';

export function MiniMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // non-auth users may not see messages list
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.content) {
      setError('请填写所有字段');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ name: '', email: '', content: '' });
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        setError(data.error || '提交失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: '待审核', color: 'text-black/40' },
    approved: { text: '已通过', color: 'text-black/60' },
    rejected: { text: '已拒绝', color: 'text-black/30' },
  };

  return (
    <div>
      <div className="px-4 pt-4 pb-3 border-b border-black/5">
        <h1 className="text-lg font-bold tracking-tight">留言</h1>
        <p className="text-xs text-black/40 mt-0.5">留下你的想法和建议</p>
      </div>

      {/* Submit form */}
      <div className="px-4 py-4">
        {submitted && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-black/[0.03] border border-black/10 rounded text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-black/50" />
            <span>留言已提交，等待审核</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-black/40 mb-1 block">姓名</label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/25" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="你的名字"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-black/10 rounded focus:border-foreground focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-black/40 mb-1 block">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/25" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-black/10 rounded focus:border-foreground focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-black/40 mb-1 block">留言内容</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="写下你的想法..."
              rows={3}
              className="w-full px-3 py-2 text-xs border border-black/10 rounded focus:border-foreground focus:outline-none transition-colors resize-none"
            />
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 text-xs border border-foreground text-foreground rounded hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
          >
            {submitting ? '提交中...' : '提交留言'}
          </button>
        </form>
      </div>

      {/* Message history */}
      {messages.length > 0 && (
        <div>
          <div className="px-4 py-2 border-t border-black/5">
            <h2 className="text-xs font-medium text-black/50">我的留言</h2>
          </div>
          <div className="divide-y divide-black/5">
            {messages.map((msg) => {
              const st = statusLabel[msg.status] || statusLabel.pending;
              return (
                <div key={msg.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{msg.name}</span>
                    <span className={`text-[10px] ${st.color}`}>{st.text}</span>
                  </div>
                  <p className="text-xs text-black/60 leading-relaxed">{msg.content}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-black/25">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.created_at).toLocaleDateString('zh-CN')}
                  </div>
                  {msg.reply && (
                    <div className="mt-2 pl-3 border-l-2 border-black/10 text-xs text-black/50">
                      回复：{msg.reply}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && messages.length === 0 && (
        <div className="py-8 text-center">
          <MessageSquare className="w-8 h-8 text-black/10 mx-auto mb-2" />
          <p className="text-xs text-black/30">暂无留言记录</p>
        </div>
      )}
    </div>
  );
}
