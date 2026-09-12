'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
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

const COLORS = [
  '#f59e0b', '#fb7185', '#8b5cf6', '#34d399',
  '#60a5fa', '#f43f5e', '#a78bfa', '#fbbf24',
  '#2dd4bf', '#e879f9', '#fb923c', '#4ade80',
];

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent, answer
}: any) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function ResultsChart({
  questionText,
  results,
  totalVotes,
  leadingAnswer,
  otherSubmissions,
}: ResultsChartProps) {
  const [showOthers, setShowOthers] = useState(false);
  const pendingOthers = otherSubmissions.filter(o => !o.mappedTo && !o.dismissed);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{questionText}</h3>
      <p className="text-sm text-gray-400 mb-6">{totalVotes} total vote{totalVotes !== 1 ? 's' : ''}</p>

      {totalVotes === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No votes yet for this question.
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Pie Chart */}
            <div className="w-full lg:w-1/2 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={results}
                    dataKey="count"
                    nameKey="answer"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={50}
                    paddingAngle={2}
                    label={renderCustomLabel}
                    labelLine={false}
                    animationBegin={0}
                    animationDuration={600}
                  >
                    {results.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)', padding: '8px 14px' }}
                    formatter={(value: any, name: any) => [`${value} vote${value !== 1 ? 's' : ''}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend / Ranking */}
            <div className="w-full lg:w-1/2 space-y-3">
              {results.map((entry, index) => (
                <div key={entry.answer} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className={`text-sm font-medium truncate ${entry.answer === leadingAnswer ? 'text-amber-600' : 'text-gray-700'}`}>
                        {entry.answer === leadingAnswer ? '👑 ' : ''}{entry.answer}
                      </span>
                      <span className="text-sm text-gray-500 flex-shrink-0">
                        {entry.count} ({entry.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${entry.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                <div className="mt-4 grid gap-2">
                  {pendingOthers.map(sub => (
                    <div key={sub.id} className="bg-gray-50 px-4 py-3 rounded-lg text-sm text-gray-700 border border-gray-100">
                      &quot;{sub.originalText}&quot;
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
