import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import type { Article } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category_id = searchParams.get('category_id');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const isPublic = searchParams.get('public') === 'true';

    let query = client
      .from('articles')
      .select('id, title, slug, summary, cover_image, category_id, author, view_count, status, is_top, created_at, updated_at, categories(id, name, slug)', { count: 'exact' })
      .order('is_top', { ascending: false })
      .order('created_at', { ascending: false });

    if (isPublic || status) {
      query = query.eq('status', status || 'published');
    }
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({
      articles: data as unknown as Article[],
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
    const { title, slug, content, summary, cover_image, category_id, author, status } = body;

    if (!title || !slug || !content || !category_id) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const { data, error } = await client
      .from('articles')
      .insert({
        title,
        slug,
        content,
        summary: summary || null,
        cover_image: cover_image || null,
        category_id,
        author: author || 'Admin',
        status: status || 'draft',
      })
      .select()
      .single();

    if (error) throw new Error(`创建失败: ${error.message}`);

    return NextResponse.json({ success: true, article: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '创建失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
