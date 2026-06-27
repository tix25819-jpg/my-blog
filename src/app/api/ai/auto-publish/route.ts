import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { authenticateRequest } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const admin = await authenticateRequest(request);
    if (!admin) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { category, topic, style, language } = await request.json();

    // 1. 确定分类：优先用传入的，否则随机选一个
    const supabase = getSupabaseClient();
    let categoryId = category as string | undefined;

    if (!categoryId) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .order('sort_order');
      if (cats && cats.length > 0) {
        const randomCat = cats[Math.floor(Math.random() * cats.length)];
        categoryId = randomCat.id;
      }
    }

    // 2. 确定主题：优先用传入的，否则让 AI 自选
    const shouldPickTopic = !topic;

    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 如果没有主题，先用 AI 选一个
    let finalTopic = topic || '';
    if (shouldPickTopic) {
      const topicResponse = await client.invoke(
        [
          {
            role: 'system',
            content: '你是一位编程选题专家。请给出一个具体的编程技术文章标题，只返回标题本身，不要编号、不要引号、不要多余解释。标题要吸引人、有实用价值。',
          },
          {
            role: 'user',
            content: '请给出一个2025年最值得写的编程技术文章标题，方向可以是AI编程、前端开发、后端架构、DevOps或编程思维中的任意一个。',
          },
        ],
        { model: 'doubao-seed-2-0-lite-260215', temperature: 0.9 }
      );
      finalTopic = topicResponse.content.trim();
    }

    // 3. 生成文章内容（非流式，因为需要完整内容存库）
    const systemPrompt = `你是一位专业的编程技术博客作者。你需要根据给定的主题，撰写一篇高质量的编程技术文章。
要求：
1. 文章结构：# 标题 → 引言（1-2段）→ 正文（3-5个章节，含代码示例）→ 总结
2. 代码示例实用、简洁、可运行，使用代码块包裹并标注语言
3. 语言风格${style || '专业但不失亲和力，像在跟同事聊天'}
4. 使用${language || '中文'}撰写
5. 文章字数800-1500字
6. 输出纯 Markdown 格式
7. 第一行必须是 # 开头的标题`;

    const articleResponse = await client.invoke(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请写一篇关于「${finalTopic}」的编程技术文章` },
      ],
      { model: 'doubao-seed-2-0-lite-260215', temperature: 0.8 }
    );

    const content = articleResponse.content.trim();
    if (!content) {
      return NextResponse.json({ error: 'AI 生成内容为空' }, { status: 500 });
    }

    // 4. 从内容中提取标题
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : finalTopic;

    // 5. 生成摘要（取前150字，去掉 markdown 符号）
    const plainText = content
      .replace(/^#+\s+.*/gm, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/[*_~]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    const summary = plainText.slice(0, 150) + (plainText.length > 150 ? '...' : '');

    // 6. 生成 slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // 7. 存入数据库
    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        content,
        summary,
        category_id: categoryId || null,
        author: admin.username || 'AI',
        status: 'published',
        is_top: false,
        view_count: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `保存失败: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        status: article.status,
        created_at: article.created_at,
      },
      meta: {
        topic: finalTopic,
        autoTopic: shouldPickTopic,
        category_id: categoryId,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '自动发布失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
