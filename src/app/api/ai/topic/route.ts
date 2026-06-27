import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { field, difficulty, trend } = await request.json();
    if (!field) {
      return NextResponse.json({ error: '请提供编程领域' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位资深的编程选题顾问。你需要根据给定的编程领域，推荐适合的编程选题。
要求：
1. 每个选题包含：标题、简介、技术栈、难度、预期收获
2. 推荐选题要有实用性和前瞻性
3. 考虑当前技术趋势和社区热点
4. 难度级别：${difficulty || '中级'}
${trend ? `5. 特别关注方向：${trend}` : ''}`;

    const response = await client.invoke(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请为「${field}」领域推荐5个编程选题，以JSON数组格式返回，每个选题包含 title、description、techStack、difficulty、expectedGain 字段` },
      ],
      { model: 'doubao-seed-2-0-lite-260215', temperature: 0.8 }
    );

    return NextResponse.json({ success: true, topics: response.content });
  } catch (err) {
    const message = err instanceof Error ? err.message : '选题推荐失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
