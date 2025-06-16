console.log("🔒 middleware 発火チェック");

import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const USER = 'YOKO';
  const PASS = 'TOMOSAN';

  const basicAuth = req.headers.get('authorization');

  if (!basicAuth) {
    return new NextResponse('Auth Required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="protected"' },
    });
  }

  const [scheme, encoded] = basicAuth.split(' ');
  if (scheme !== 'Basic') return NextResponse.next();

  // ✅ Node.js で Base64 をデコード（atob の代用）
  const decoded = Buffer.from(encoded, 'base64').toString();
  const [user, pass] = decoded.split(':');

  if (user !== USER || pass !== PASS) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}

// ✅ matcher を設定（これがないとミドルウェアが適用されない）
export const config = {
  matcher: '/:path*',
};


