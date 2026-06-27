import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { error } = await client.rpc('increment_view_count', { article_id: id });

    if (error) {
      // Fallback: manual increment if RPC not available
      const { data: article } = await client
        .from('articles')
        .select('view_count')
        .eq('id', id)
        .maybeSingle();

      if (article) {
        await client
          .from('articles')
          .update({ view_count: (article.view_count || 0) + 1 })
          .eq('id', id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
