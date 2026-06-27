import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { authenticateRequest } from '@/lib/auth';
import type { SiteConfigItem, SiteConfigMap } from '@/lib/types';

export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('site_config').select('*');

    if (error) throw new Error(`查询失败: ${error.message}`);

    const configMap: SiteConfigMap = {};
    (data as SiteConfigItem[]).forEach((item) => {
      configMap[item.config_key] = item.config_value;
    });

    return NextResponse.json({ config: configMap, items: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await authenticateRequest(request);
    if (!admin) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const client = getSupabaseClient();
    const body = await request.json();
    const { configs } = body as { configs: Record<string, string> };

    if (!configs || typeof configs !== 'object') {
      return NextResponse.json({ error: '配置数据格式错误' }, { status: 400 });
    }

    const results: string[] = [];
    for (const [key, value] of Object.entries(configs)) {
      const { error } = await client
        .from('site_config')
        .update({ config_value: value, updated_at: new Date().toISOString() })
        .eq('config_key', key);

      if (error) {
        results.push(`${key}: 更新失败`);
      } else {
        results.push(`${key}: 更新成功`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
