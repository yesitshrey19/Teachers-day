import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== 'open' && action !== 'close') {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    const updateData = action === 'open' 
      ? { is_open: true, closed_at: null }
      : { is_open: false, closed_at: new Date().toISOString() };

    const { error } = await supabase
      .from('poll_config')
      .update(updateData)
      .neq('id', '00000000-0000-0000-0000-000000000000'); 

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to update poll state' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { isOpen: action === 'open' } });
  } catch (error) {
    console.error('Admin poll-control error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
