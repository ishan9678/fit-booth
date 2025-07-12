import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    // Check if Socket.IO server is running
    const response = await fetch(`${socketUrl}/api/socket/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Socket.IO server is not responding');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      socketServer: {
        status: 'healthy',
        url: socketUrl,
        ...data,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      socketServer: {
        status: 'unhealthy',
        url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
      },
    }, { status: 500 });
  }
}
