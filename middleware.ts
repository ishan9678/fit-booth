import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle Socket.IO related requests
  if (request.nextUrl.pathname.startsWith('/socket.io')) {
    // Rewrite Socket.IO requests to the Socket.IO server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, socketUrl);
    
    return NextResponse.rewrite(url);
  }
  
  // Handle WebSocket upgrade requests
  if (request.headers.get('upgrade') === 'websocket') {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, socketUrl);
    
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/socket.io/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
