import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { RateLimiter } from '@/lib/utils';
import { ApiResponse, ValidateCodeResponse } from '@/lib/types';

// Rate limiter: 5 attempts per 1 minute (60000ms)
const rateLimiter = new RateLimiter(5, 60000);

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!rateLimiter.isAllowed(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' } as ApiResponse,
        { status: 429 }
      );
    }

    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid code is required' } as ApiResponse,
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    
    // Check if code exists and is unused
    const { data: voterCode, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .eq('used', false)
      .single();

    if (error || !voterCode) {
      return NextResponse.json(
        { success: true, data: { valid: false } } as ApiResponse<ValidateCodeResponse>
      );
    }

    // Mark code as used
    const { error: updateError } = await supabase
      .from('access_codes')
      .update({ used: true })
      .eq('id', voterCode.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to validate code' } as ApiResponse,
        { status: 500 }
      );
    }

    // Generate session token (simple random string for this app)
    const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Set cookie
    const response = NextResponse.json(
      { success: true, data: { valid: true } } as ApiResponse<ValidateCodeResponse>
    );
    
    response.cookies.set({
      name: 'voter_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error) {
    console.error('Validate code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
