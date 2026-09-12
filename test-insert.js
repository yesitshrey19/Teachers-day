const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uvvehtgtcmzuzaxeibpb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dmVodGd0Y216dXpheGVpYnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTMyNjgsImV4cCI6MjEwNDcyOTI2OH0.GoE6TvEnVuEw_aROdx-nr2d-LyDLiDGLqvgbQGO0tJo'
);

async function test() {
  const { data, error } = await supabase
    .from('votes')
    .insert({
      question_index: 0,
      answer: 'Test Answer',
      is_other: false
    })
    .select('id')
    .single();

  console.log('Insert Result:', data);
  console.log('Insert Error:', error);
}

test();
