const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://uvvehtgtcmzuzaxeibpb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dmVodGd0Y216dXpheGVpYnBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE1MzI2OCwiZXhwIjoyMTA0NzI5MjY4fQ.u43vScHvJPQHTF8Kx5jyDSE1t2elO867HnW59oYbwNI'
);
async function test() {
  const { data: inserted, error: insertError } = await supabase
    .from('votes')
    .insert({ question_index: 2, answer: 'Check This', is_other: false })
    .select()
    .single();
  console.log('Inserted:', inserted, insertError);
  
  if (inserted) {
    const { data: selected, error: selectError } = await supabase
      .from('votes')
      .select('*')
      .eq('id', inserted.id);
    console.log('Selected by ID:', selected, selectError);
  }
}
test();
