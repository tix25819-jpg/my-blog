import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = await authenticateRequest(request);
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    return NextResponse.json({ valid: true, admin });
  } catch {
    return NextResponse.json({ error: '验证失败' }, { status: 500 });
  }
}
