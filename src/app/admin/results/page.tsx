'use client';

import { useState, useEffect } from 'react';
import { AdminResultsResponse, QuestionResult } from '@/lib/types';
import ResultsChart from '@/components/ResultsChart';
import PollControl from '@/components/PollControl';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/admin/results');
      const result = await response.json();

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch results');
      }
    } catch (err) {
      setError('Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();

    const supabase = createClient();
    
    // Subscribe to realtime changes on votes and duo_votes tables
    const channel = supabase
      .channel('poll-results-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        fetchResults();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'duo_votes' }, () => {
        fetchResults();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const handleTogglePoll = async (action: 'open' | 'close') => {
    try {
      const response = await fetch('/api/admin/poll-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const result = await response.json();
      if (result.success) {
        fetchResults();
      } else {
        alert(result.error || 'Failed to toggle poll');
      }
    } catch (err) {
      alert('Error toggling poll');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading results...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-center">No data available</div>;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Poll Results Dashboard</h1>
        
        <div className="mb-12">
          <PollControl
            isOpen={data.pollOpen}
            onToggle={handleTogglePoll}
            totalVoters={data.totalVoters}
          />
        </div>

        <div className="space-y-12">
          {data.questions.map((question: QuestionResult) => (
            <ResultsChart
              key={question.questionIndex}
              questionIndex={question.questionIndex}
              questionText={question.questionText}
              totalVotes={question.totalVotes}
              results={question.results}
              leadingAnswer={question.leadingAnswer}
              otherSubmissions={question.otherSubmissions}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
