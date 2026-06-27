'use client';

import { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import type { Message } from '@/lib/types';

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchMessages = async () => {
    const token = localStorage.getItem('admin_token');
    const statusParam = filter !== 'all' ? `&status=${filter}` : '';
    const res = await fetch(`/api/messages?page_size=50${statusParam}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, [filter]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const token = localStorage.getItem('admin_token');
    await fetch(`/api/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: action }),
    });
    fetchMessages();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = messages.filter(m => m.status === 'pending').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">留言管理</h1>
        {pendingCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400">{pendingCount} 条待审核</span>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === s ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-accent'
            }`}
          >
            {s === 'all' ? '全部' : s === 'pending' ? '待审核' : s === 'approved' ? '已通过' : '已拒绝'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{msg.name}</span>
                  <span className="text-xs text-muted-foreground">{msg.email}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    msg.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                    msg.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {msg.status === 'pending' ? '待审核' : msg.status === 'approved' ? '已通过' : '已拒绝'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(msg.created_at).toLocaleString('zh-CN')}</p>
              </div>
              {msg.status === 'pending' && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleAction(msg.id, 'approved')}
                    className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    title="通过"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleAction(msg.id, 'rejected')}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    title="拒绝"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">暂无留言</div>
        )}
      </div>
    </div>
  );
}
