import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.password || body.password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessionToken = crypto.randomUUID();
    const cookieStore = await cookies();
    
    cookieStore.set('admin_session', sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 86400,
      secure: process.env.NODE_ENV === 'production'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
