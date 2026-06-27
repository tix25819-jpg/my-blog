import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { authenticateRequest } from '@/lib/auth';
import type { Message } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const admin = await authenticateRequest(request);
    if (!admin) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');

    let query = client
      .from('messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({
      messages: data as Message[],
      total: count,
      page,
      pageSize,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { name, email, content } = body;

    if (!name || !email || !content) {
      return NextResponse.json({ error: '姓名、邮箱和内容不能为空' }, { status: 400 });
    }

    const { data, error } = await client
      .from('messages')
      .insert({ name, email, content, status: 'pending' })
      .select()
      .single();

    if (error) throw new Error(`提交失败: ${error.message}`);

    return NextResponse.json({ success: true, message: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '提交失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
