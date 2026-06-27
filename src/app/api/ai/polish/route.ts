import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const admin = await authenticateRequest(request);
    if (!admin) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { content, instructions } = await request.json();
    if (!content) {
      return NextResponse.json({ error: '请提供文章内容' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位专业的编程文章编辑。你需要对给定的文章进行润色优化。
润色要求：
1. 保持原文核心内容和技术准确性
2. 优化表达，使文章更流畅易读
3. 改善代码示例的格式和注释
4. 确保技术术语使用准确
5. 保持 Markdown 格式
${instructions ? `6. 额外要求：${instructions}` : ''}`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `请润色以下文章：\n\n${content}` },
            ],
            { model: 'doubao-seed-2-0-lite-260215', temperature: 0.5 }
          );

          for await (const chunk of llmStream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content.toString() })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : '润色失败';
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
    const message = err instanceof Error ? err.message : '润色失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
