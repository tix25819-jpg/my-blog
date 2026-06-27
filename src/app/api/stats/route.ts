import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { authenticateRequest } from '@/lib/auth';
import type { DashboardStats } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const admin = await authenticateRequest(request);
    if (!admin) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const client = getSupabaseClient();

    const [articlesResult, publishedResult, categoriesResult, messagesResult, pendingResult, viewsResult, recentArticlesResult, recentMessagesResult] = await Promise.all([
      client.from('articles').select('*', { count: 'exact', head: true }),
      client.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      client.from('categories').select('*', { count: 'exact', head: true }),
      client.from('messages').select('*', { count: 'exact', head: true }),
      client.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      client.from('articles').select('view_count'),
      client.from('articles').select('id, title, slug, status, created_at, categories(id, name)').order('created_at', { ascending: false }).limit(5),
      client.from('messages').select('id, name, email, content, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    const totalViews = (viewsResult.data || []).reduce((sum: number, a: { view_count: number }) => sum + (a.view_count || 0), 0);

    const stats: DashboardStats = {
      totalArticles: articlesResult.count || 0,
      publishedArticles: publishedResult.count || 0,
      totalCategories: categoriesResult.count || 0,
      totalMessages: messagesResult.count || 0,
      pendingMessages: pendingResult.count || 0,
      totalViews: totalViews,
      recentArticles: (recentArticlesResult.data || []) as unknown as DashboardStats['recentArticles'],
      recentMessages: (recentMessagesResult.data || []) as DashboardStats['recentMessages'],
    };

    return NextResponse.json({ stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
