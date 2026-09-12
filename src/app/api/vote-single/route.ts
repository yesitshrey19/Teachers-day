import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/types';
import { isDuoQuestion } from '@/lib/utils';

// Submit a single vote and return live results for that question
export async function POST(request: Request) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();
    const { questionIndex, answer, isOther, faculty1, faculty2 } = body;

    // Check poll is open
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

    // Insert the vote
    if (isDuoQuestion(questionIndex)) {
      if (faculty1 || faculty2) {
        const { error: insertError } = await adminClient
          .from('duo_votes')
          .insert({
            faculty_1: faculty1,
            faculty_2: faculty2 || '',
            is_other: isOther || false
          });
        if (insertError) {
          return NextResponse.json(
            { success: false, error: 'Database error: ' + insertError.message } as ApiResponse,
            { status: 500 }
          );
        }
      }
    } else {
      if (answer !== null && answer !== undefined) {
        const { error: insertError } = await adminClient
          .from('votes')
          .insert({
            question_index: questionIndex,
            answer: answer,
            is_other: isOther || false
          });
        if (insertError) {
          return NextResponse.json(
            { success: false, error: 'Database error: ' + insertError.message } as ApiResponse,
            { status: 500 }
          );
        }
      }
    }

    // Fetch current results for this question
    let results: { answer: string; count: number; percentage: number }[] = [];
    let totalVotes = 0;

    if (isDuoQuestion(questionIndex)) {
      const { data: duoVotes } = await adminClient.from('duo_votes').select('faculty_1, faculty_2');
      if (duoVotes) {
        totalVotes = duoVotes.length;
        const counts = new Map<string, number>();
        duoVotes.forEach((v: any) => {
          const pair = [v.faculty_1, v.faculty_2].sort().join(' & ');
          counts.set(pair, (counts.get(pair) || 0) + 1);
        });
        results = Array.from(counts.entries())
          .map(([answer, count]) => ({
            answer,
            count,
            percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count);
      }
    } else {
      const { data: votes } = await adminClient
        .from('votes')
        .select('answer')
        .eq('question_index', questionIndex);
      if (votes) {
        totalVotes = votes.length;
        const counts = new Map<string, number>();
        votes.forEach((v: any) => {
          if (v.answer) {
            counts.set(v.answer, (counts.get(v.answer) || 0) + 1);
          }
        });
        results = Array.from(counts.entries())
          .map(([answer, count]) => ({
            answer,
            count,
            percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count);
      }
    }

    return NextResponse.json({
      success: true,
      data: { results, totalVotes }
    });

  } catch (error) {
    console.error('Vote-single error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
