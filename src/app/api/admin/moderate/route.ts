import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';
import { isValidFacultyName } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mappingId, mappedTo, dismiss } = body;

    if (!mappingId) {
      return NextResponse.json({ success: false, error: 'Mapping ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (dismiss) {
      const { error } = await supabase
        .from('other_mappings')
        .update({ dismissed: true })
        .eq('id', mappingId);

      if (error) {
        return NextResponse.json({ success: false, error: 'Failed to dismiss mapping' }, { status: 500 });
      }
    } else if (mappedTo) {
      if (!isValidFacultyName(mappedTo)) {
         return NextResponse.json({ success: false, error: 'Invalid faculty name' }, { status: 400 });
      }
      
      const { error } = await supabase
        .from('other_mappings')
        .update({ mapped_to: mappedTo })
        .eq('id', mappingId);

      if (error) {
         return NextResponse.json({ success: false, error: 'Failed to update mapping' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ success: false, error: 'Must provide mappedTo or dismiss' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin moderate error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
