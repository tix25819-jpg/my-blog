import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const admin = await authenticateRequest(request);
    if (!admin) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { topic, style, language } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: '请提供文章主题' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位专业的编程技术博客作者。你需要根据给定的主题，撰写一篇高质量的编程技术文章。
要求：
1. 文章结构清晰，包含标题、引言、正文（含代码示例）、总结
2. 代码示例实用且可运行
3. 语言风格${style || '专业但不失亲和力'}
4. 使用${language || '中文'}撰写
5. 输出纯 Markdown 格式`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `请写一篇关于「${topic}」的编程技术文章` },
            ],
            { model: 'doubao-seed-2-0-lite-260215', temperature: 0.8 }
          );

          for await (const chunk of llmStream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content.toString() })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : '生成失败';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '生成失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
