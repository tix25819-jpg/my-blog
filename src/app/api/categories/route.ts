import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { authenticateRequest } from '@/lib/auth';
import type { Category } from '@/lib/types';

export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({ categories: data as Category[] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await authenticateRequest(request);
    if (!admin) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const client = getSupabaseClient();
    const body = await request.json();
    const { name, slug, description, sort_order } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: '名称和别名不能为空' }, { status: 400 });
    }

    const { data, error } = await client
      .from('categories')
      .insert({ name, slug, description: description || null, sort_order: sort_order || 0 })
      .select()
      .single();

    if (error) throw new Error(`创建失败: ${error.message}`);

    return NextResponse.json({ success: true, category: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '创建失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
