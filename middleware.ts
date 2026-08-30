import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;

  if (!password) {
    return new NextResponse('DOO Field Manual is locked. Configure SITE_PASSWORD before serving it.', {
      status: 503,
      headers: { 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }

  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const separator = decoded.indexOf(':');
      const supplied = separator >= 0 ? decoded.slice(separator + 1) : '';
      if (supplied === password) {
        const response = NextResponse.next();
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return response;
      }
    } catch {
      // Fall through to the password challenge.
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="DOO Field Manual", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
