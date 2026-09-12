import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ApiResponse, VoteSubmission, DuoVoteAnswer } from '@/lib/types';
import { isDuoQuestion } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('voter_session');

    if (!sessionToken?.value) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    // Use adminClient to bypass RLS for poll_config check
    const { data: settings, error: settingsError } = await adminClient
      .from('poll_config')
      .select('is_open')
      .single();

    if (settingsError || !settings?.is_open) {
      return NextResponse.json(
        { success: false, error: 'Poll is closed' } as ApiResponse,
        { status: 403 }
      );
    }

    const body: VoteSubmission = await request.json();
    
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission format' } as ApiResponse,
        { status: 400 }
      );
    }

    // Process each answer
    for (const answer of body.answers) {
      // Skip unanswered questions
      if (!isDuoQuestion(answer.questionIndex)) {
        if ((answer as any).answer === null) {
          continue;
        }
      } else {
        const duoAnswer = answer as DuoVoteAnswer;
        if (!duoAnswer.faculty1 && !duoAnswer.faculty2) {
          continue; // skip empty duo question
        }
      }

      if (isDuoQuestion(answer.questionIndex)) {
        const duoAnswer = answer as DuoVoteAnswer;
        const { data: insertedVote, error: insertError } = await adminClient
          .from('duo_votes')
          .insert({
            faculty_1: duoAnswer.faculty1,
            faculty_2: duoAnswer.faculty2,
            is_other: duoAnswer.isOther
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting duo vote:', insertError);
          return NextResponse.json({ success: false, error: 'Database error: ' + insertError.message } as ApiResponse, { status: 500 });
        }

        if (duoAnswer.isOther && insertedVote) {
          await adminClient.from('other_mappings').insert({
            table_name: 'duo_votes',
            vote_id: insertedVote.id,
            original_text: `${duoAnswer.faculty1}, ${duoAnswer.faculty2}`
          });
        }
      } else {
        const standardAnswer = answer as any;
        const { data: insertedVote, error: insertError } = await adminClient
          .from('votes')
          .insert({
            question_index: standardAnswer.questionIndex,
            answer: standardAnswer.answer,
            is_other: standardAnswer.isOther
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting vote:', insertError);
          return NextResponse.json({ success: false, error: 'Database error: ' + insertError.message } as ApiResponse, { status: 500 });
        }

        if (standardAnswer.isOther && insertedVote) {
          await adminClient.from('other_mappings').insert({
            table_name: 'votes',
            vote_id: insertedVote.id,
            original_text: standardAnswer.answer
          });
        }
      }
    }

    // Clear session cookie after successful vote
    const response = NextResponse.json({ success: true } as ApiResponse);
    response.cookies.delete('voter_session');

    return response;

  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
