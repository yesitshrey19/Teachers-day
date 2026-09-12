const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://uvvehtgtcmzuzaxeibpb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE1MzI2OCwiZXhwIjoyMTA0NzI5MjY4fQ.u43vScHvJPQHTF8Kx5jyDSE1t2elO867HnW59oYbwNI'
);
async function test() {
  const { data: v } = await supabase.from('votes').select('*');
  console.log('Votes count:', v ? v.length : 0);
}
test();
