'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ResultsChartProps {
  questionText: string;
  questionIndex: number;
  results: {
    answer: string;
    count: number;
    percentage: number;
  }[];
  totalVotes: number;
  leadingAnswer: string;
  otherSubmissions: {
    id: string;
    originalText: string;
    mappedTo: string | null;
    dismissed: boolean;
  }[];
}

export default function ResultsChart({
  questionText,
  results,
  totalVotes,
  leadingAnswer,
  otherSubmissions,
}: ResultsChartProps) {
  const [showAll, setShowAll] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  
  const displayResults = showAll ? results : results.slice(0, 10);
  const pendingOthers = otherSubmissions.filter(o => !o.mappedTo && !o.dismissed);

  // Warm color palette
  const colors = [
    '#f59e0b', // amber-500
    '#fb7185', // rose-400
    '#f43f5e', // rose-500
    '#a78bfa', // violet-400
    '#8b5cf6', // violet-500
    '#fbbf24', // amber-400
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">{questionText}</h3>
      
      {totalVotes === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No votes yet for this question.
        </div>
      ) : (
        <>
          <div className="h-96 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={displayResults}
                margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="answer" 
                  type="category" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }}
                  width={150}
                  tickFormatter={(val) => val === leadingAnswer ? `👑 ${val}` : val}
                />
                <Tooltip 
                  cursor={{ fill: '#fef3c7', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value} votes (${props.payload.percentage}%)`,
                    'Votes'
                  ]}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                  {displayResults.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {results.length > 10 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 px-4 py-2 rounded-full"
              >
                {showAll ? 'Show top 10' : `Show all ${results.length} results`}
              </button>
            </div>
          )}
          
          {pendingOthers.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <button 
                onClick={() => setShowOthers(!showOthers)}
                className="flex items-center gap-2 text-gray-600 font-medium hover:text-gray-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${showOthers ? 'rotate-90' : ''}`}>
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                {pendingOthers.length} Unmapped 'Other' submissions
              </button>
              
              {showOthers && (
                <div className="mt-4 grid gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                  {pendingOthers.map(sub => (
                    <div key={sub.id} className="bg-gray-50 px-4 py-3 rounded-lg text-sm text-gray-700 border border-gray-100">
                      "{sub.originalText}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
