'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OtherModeration from '@/components/OtherModeration';

export interface AdminResultsResponse {
  questions: QuestionResult[];
  pollOpen: boolean;
  totalVoters: number;
}

export interface QuestionResult {
  questionIndex: number;
  questionText: string;
  totalVotes: number;
  results: { answer: string; count: number; percentage: number; }[];
  leadingAnswer: string;
  otherSubmissions: {
    id: string;
    originalText: string;
    mappedTo: string | null;
    dismissed: boolean;
  }[];
}

interface FlattenedMapping {
  id: string;
  originalText: string;
  mappedTo: string | null;
  dismissed: boolean;
  questionIndex: number;
  questionText: string;
}

export default function ModeratePage() {
  const [mappings, setMappings] = useState<FlattenedMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const fetchResults = async () => {
    try {
      setLoading(true);
      const auth = localStorage.getItem('adminAuth') || '';
      const res = await fetch('/api/admin/results', {
        headers: {
          'Authorization': `Bearer ${auth}`
        }
      });
      
      const json = await res.json();
      
      if (json.success && json.data) {
        const data: AdminResultsResponse = json.data;
        const allMappings: FlattenedMapping[] = [];
        
        data.questions.forEach((q) => {
          if (q.otherSubmissions) {
            q.otherSubmissions.forEach((sub) => {
              if (!sub.mappedTo && !sub.dismissed) {
                allMappings.push({
                  ...sub,
                  questionIndex: q.questionIndex,
                  questionText: q.questionText
                });
              }
            });
          }
        });
        
        setMappings(allMappings);
        setError('');
      } else {
        setError('Failed to fetch results');
      }
    } catch (err) {
      setError('An error occurred while fetching');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
      router.push('/admin');
      return;
    }
    fetchResults();
  }, [router]);

  const handleMap = async (mappingId: string, facultyName: string) => {
    try {
      setError('');
      const auth = localStorage.getItem('adminAuth') || '';
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        body: JSON.stringify({ mappingId, mappedTo: facultyName, dismiss: false })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Mapping updated successfully');
        setTimeout(() => setSuccess(''), 3000);
        fetchResults();
      } else {
        setError(json.error || 'Failed to update mapping');
      }
    } catch (err) {
      setError('An error occurred while mapping');
    }
  };

  const handleDismiss = async (mappingId: string) => {
    try {
      setError('');
      const auth = localStorage.getItem('adminAuth') || '';
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        body: JSON.stringify({ mappingId, dismiss: true })
      });
      const json = await res.json();
      if (json.success) {
        setSuccess('Entry dismissed successfully');
        setTimeout(() => setSuccess(''), 3000);
        fetchResults();
      } else {
        setError(json.error || 'Failed to dismiss entry');
      }
    } catch (err) {
      setError('An error occurred while dismissing');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">Moderate "Other" Submissions</h1>
          <Link href="/admin/results" className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Results
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md shadow-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md shadow-sm">
            {success}
          </div>
        )}

        {loading && mappings.length === 0 ? (
          <div className="text-center py-12 text-indigo-600 font-medium">
            Loading submissions...
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 border border-slate-200">
            {mappings.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No pending submissions to moderate.</p>
            ) : (
              <OtherModeration 
                mappings={mappings} 
                onMap={handleMap} 
                onDismiss={handleDismiss} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
