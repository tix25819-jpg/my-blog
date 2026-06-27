'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, Settings, CheckCircle2, AlertCircle } from 'lucide-react';

/* ---------- 类型 ---------- */
type ConfigItem = { config_key: string; config_value: string; description: string };
type ToastState = { show: boolean; success: boolean; message: string };

/* ---------- 表单字段定义 ---------- */
interface FormField {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'textarea' | 'richtext';
  rows?: number;
  placeholder?: string;
}

const FORM_FIELDS: FormField[] = [
  {
    key: 'site_name',
    label: '站点名称',
    description: '博客网站的显示名称，将同步更新到导航栏和页脚',
    type: 'text',
    placeholder: '输入站点名称',
  },
  {
    key: 'site_description',
    label: '网站简介',
    description: '网站的简短描述，显示在首页 Hero 区域和 SEO 元数据中',
    type: 'textarea',
    rows: 3,
    placeholder: '输入网站简介…',
  },
  {
    key: 'contact_info',
    label: 'Contact 页面联系信息',
    description: '联系页面的详细联系信息，支持多行文本，将显示在联系页面',
    type: 'richtext',
    rows: 6,
    placeholder: '输入联系信息，如邮箱、社交账号等…',
  },
  {
    key: 'footer_copyright',
    label: '页脚版权文字',
    description: '网站页脚显示的版权信息文字',
    type: 'text',
    placeholder: '输入版权文字',
  },
];

/* ---------- 组件 ---------- */
export function AdminConfig() {
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, success: false, message: '' });

  /* ---- 加载配置 ---- */
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch('/api/site-config', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const items: ConfigItem[] = data.items ?? [];
        const vals: Record<string, string> = {};
        items.forEach((c) => {
          vals[c.config_key] = c.config_value ?? '';
        });
        setEditedValues(vals);
        setOriginalValues(vals);
      })
      .catch(() => {
        showToast(false, '加载配置失败，请刷新重试');
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---- 自动关闭 Toast ---- */
  const showToast = useCallback((success: boolean, message: string) => {
    setToast({ show: true, success, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  /* ---- 保存配置 ---- */
  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    try {
      // 只提交表单中包含的字段
      const payload: Record<string, string> = {};
      FORM_FIELDS.forEach((f) => {
        payload[f.key] = editedValues[f.key] ?? '';
      });

      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ configs: payload }),
      });
      const data = await res.json();

      if (data.success) {
        setOriginalValues({ ...editedValues });
        showToast(true, '配置已保存，前台内容已同步更新');
      } else {
        showToast(false, data.error || '保存失败');
      }
    } catch {
      showToast(false, '网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  /* ---- 是否有修改 ---- */
  const hasChanges = FORM_FIELDS.some(
    (f) => (editedValues[f.key] ?? '') !== (originalValues[f.key] ?? '')
  );

  /* ---- 渲染字段 ---- */
  const renderField = (field: FormField) => {
    const value = editedValues[field.key] ?? '';

    if (field.type === 'text') {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => setEditedValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
          placeholder={field.placeholder}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
        />
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => setEditedValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
          placeholder={field.placeholder}
          rows={field.rows ?? 3}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-y"
        />
      );
    }

    // richtext — 多行富文本编辑区（带简易工具栏提示）
    return (
      <div className="rounded-lg border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-colors">
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-card/50 text-xs text-muted-foreground">
          <span>支持换行排版，内容将原样显示在 Contact 页面</span>
        </div>
        <textarea
          value={value}
          onChange={(e) => setEditedValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
          placeholder={field.placeholder}
          rows={field.rows ?? 6}
          className="w-full px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-y bg-transparent"
        />
      </div>
    );
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl">
      {/* Toast 提示 */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg animate-in fade-in slide-in-from-top-2">
          {toast.success ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-foreground">{toast.message}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-foreground">{toast.message}</span>
            </>
          )}
        </div>
      )}

      {/* 页头 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">站点配置</h1>
            <p className="text-xs text-muted-foreground mt-0.5">修改后保存，前台博客将同步更新</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          保存配置
        </button>
      </div>

      {/* 表单区域 */}
      <div className="space-y-5">
        {FORM_FIELDS.map((field) => {
          const changed = (editedValues[field.key] ?? '') !== (originalValues[field.key] ?? '');
          return (
            <div
              key={field.key}
              className={`p-5 rounded-xl border transition-colors ${
                changed ? 'border-primary/40 bg-primary/[0.02]' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold">{field.label}</label>
                {changed && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    已修改
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{field.description}</p>
              {renderField(field)}
            </div>
          );
        })}
      </div>

      {/* 底部保存栏 */}
      {hasChanges && (
        <div className="mt-6 flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
          <p className="text-xs text-muted-foreground">你有未保存的修改</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存配置
          </button>
        </div>
      )}
    </div>
  );
}
