import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { ApiResponse, AdminResultsResponse, QuestionResult } from '@/lib/types';
import { QUESTIONS } from '@/lib/constants';
import { isDuoQuestion } from '@/lib/utils';

export async function GET() {
  try {
    const adminClient = createAdminClient();

    const [settingsRes, usedCodesRes, votesRes, duoVotesRes, otherMappingsRes] = await Promise.all([
      adminClient.from('poll_config').select('is_open').single(),
      adminClient.from('access_codes').select('id', { count: 'exact' }).eq('used', true),
      adminClient.from('votes').select('id, question_index, answer, is_other'),
      adminClient.from('duo_votes').select('id, faculty_1, faculty_2, is_other'),
      adminClient.from('other_mappings').select('*')
    ]);

    const pollOpen = settingsRes.data?.is_open ?? false;
    const totalVoters = usedCodesRes.count ?? 0;
    
    const votes = votesRes.data || [];
    const duoVotes = duoVotesRes.data || [];
    const otherMappings = otherMappingsRes.data || [];

    const questions: QuestionResult[] = [];

    for (let i = 0; i < QUESTIONS.length; i++) {
      const questionText = QUESTIONS[i];
      let totalVotes = 0;
      const answerCounts = new Map<string, number>();
      const otherSubmissions: QuestionResult['otherSubmissions'] = [];

      if (isDuoQuestion(i)) {
        totalVotes = duoVotes.length;
        
        duoVotes.forEach((vote: any) => {
          let answerText = '';
          const mapping = otherMappings.find((m: any) => m.table_name === 'duo_votes' && m.vote_id === vote.id);
          
          if (vote.is_other) {
            if (mapping?.dismissed) return;
            answerText = mapping?.mapped_to || mapping?.original_text || `${vote.faculty_1}, ${vote.faculty_2}`;
          } else {
            // Normalize pair
            const pair = [vote.faculty_1, vote.faculty_2].sort();
            answerText = `${pair[0]} & ${pair[1]}`;
          }

          answerCounts.set(answerText, (answerCounts.get(answerText) || 0) + 1);

          if (vote.is_other && mapping) {
            otherSubmissions.push({
              id: mapping.id,
              originalText: mapping.original_text,
              mappedTo: mapping.mapped_to,
              dismissed: mapping.dismissed
            });
          }
        });
      } else {
        const qVotes = votes.filter(v => v.question_index === i);
        totalVotes = qVotes.length;

        qVotes.forEach((vote: any) => {
          let answerText = vote.answer;
          const mapping = otherMappings.find((m: any) => m.table_name === 'votes' && m.vote_id === vote.id);

          if (vote.is_other) {
            if (mapping?.dismissed) return;
            answerText = mapping?.mapped_to || mapping?.original_text || vote.answer;
          }

          answerCounts.set(answerText, (answerCounts.get(answerText) || 0) + 1);

          if (vote.is_other && mapping) {
            otherSubmissions.push({
              id: mapping.id,
              originalText: mapping.original_text,
              mappedTo: mapping.mapped_to,
              dismissed: mapping.dismissed
            });
          }
        });
      }

      const results = Array.from(answerCounts.entries())
        .map(([answer, count]) => ({
          answer,
          count,
          percentage: totalVotes > 0 ? (count / totalVotes) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      const leadingAnswer = results.length > 0 ? results[0].answer : '';

      questions.push({
        questionIndex: i,
        questionText,
        totalVotes,
        results,
        leadingAnswer,
        otherSubmissions
      });
    }

    const responseData: AdminResultsResponse = {
      questions,
      pollOpen,
      totalVoters
    };

    return NextResponse.json({ success: true, data: responseData } as ApiResponse<AdminResultsResponse>);

  } catch (error) {
    console.error('Error fetching admin results:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    );
  }
}
