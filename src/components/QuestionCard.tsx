'use client';

import React, { useState, useEffect } from 'react';
import FacultySearch from './FacultySearch';
import DuoSelector from './DuoSelector';
import { TOTAL_QUESTIONS } from '@/lib/constants';
import { VoteAnswer, DuoVoteAnswer } from '@/lib/types';

interface QuestionCardProps {
  questionIndex: number;
  questionText: string;
  isDuo: boolean;
  onAnswer: (answer: VoteAnswer | DuoVoteAnswer) => void;
  onSkip: () => void;
  initialAnswer?: VoteAnswer | DuoVoteAnswer | null;
}

interface PieResult {
  answer: string;
  count: number;
  percentage: number;
}

const PIE_COLORS = [
  '#f59e0b', '#fb7185', '#8b5cf6', '#34d399',
  '#60a5fa', '#f43f5e', '#a78bfa', '#fbbf24',
  '#2dd4bf', '#e879f9', '#fb923c', '#4ade80',
];

function MiniPieChart({ results }: { results: PieResult[] }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 70;
  const innerRadius = 40;

  let startAngle = -90;

  const total = results.reduce((s, r) => s + r.count, 0);
  if (total === 0) return null;

  const slices = results.map((r, i) => {
    const sliceAngle = (r.count / total) * 360;
    const endAngle = startAngle + sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const ix1 = cx + innerRadius * Math.cos(startRad);
    const iy1 = cy + innerRadius * Math.sin(startRad);
    const ix2 = cx + innerRadius * Math.cos(endRad);
    const iy2 = cy + innerRadius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z'
    ].join(' ');

    const slice = (
      <path key={i} d={d} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="white" strokeWidth="2" />
    );

    startAngle = endAngle;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#333">
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#888">
        votes
      </text>
    </svg>
  );
}

export default function QuestionCard({
  questionIndex,
  questionText,
  isDuo,
  onAnswer,
  onSkip,
  initialAnswer,
}: QuestionCardProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [isOther, setIsOther] = useState<boolean>(false);
  const [otherText, setOtherText] = useState<string>('');
  const [faculty1, setFaculty1] = useState<string>('');
  const [faculty2, setFaculty2] = useState<string>('');

  // Pie chart state
  const [showResults, setShowResults] = useState(false);
  const [pieResults, setPieResults] = useState<PieResult[]>([]);
  const [pieTotalVotes, setPieTotalVotes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    // Reset everything when question changes
    setShowResults(false);
    setPieResults([]);
    setPieTotalVotes(0);
    setSubmitError('');
    setIsSubmitting(false);

    if (initialAnswer) {
      setIsOther(initialAnswer.isOther);
      if (isDuo && 'faculty1' in initialAnswer) {
        setFaculty1(initialAnswer.faculty1);
        setFaculty2(initialAnswer.faculty2);
        setSelectedFaculty('');
        setOtherText('');
      } else if (!isDuo && 'answer' in initialAnswer) {
        if (initialAnswer.isOther) {
          setOtherText(initialAnswer.answer || '');
          setSelectedFaculty('');
        } else {
          setSelectedFaculty(initialAnswer.answer || '');
          setOtherText('');
        }
        setFaculty1('');
        setFaculty2('');
      }
    } else {
      setSelectedFaculty('');
      setIsOther(false);
      setOtherText('');
      setFaculty1('');
      setFaculty2('');
    }
  }, [questionIndex, initialAnswer, isDuo]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    const payload: any = {
      questionIndex,
      isOther,
    };

    if (isDuo) {
      payload.faculty1 = isOther ? otherText : faculty1;
      payload.faculty2 = isOther ? '' : faculty2;
    } else {
      payload.answer = isOther ? otherText : (selectedFaculty || null);
    }

    try {
      const res = await fetch('/api/vote-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.success && result.data) {
        setPieResults(result.data.results);
        setPieTotalVotes(result.data.totalVotes);
        setShowResults(true);
      } else {
        setSubmitError(result.error || 'Failed to submit');
      }
    } catch (err) {
      setSubmitError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoNext = () => {
    if (isDuo) {
      onAnswer({
        questionIndex: 37,
        faculty1: isOther ? otherText : faculty1,
        faculty2: isOther ? '' : faculty2,
        isOther,
      });
    } else {
      onAnswer({
        questionIndex,
        answer: isOther ? otherText : (selectedFaculty || null),
        isOther,
      });
    }
  };

  const isSubmitDisabled = isDuo
    ? isOther ? !otherText.trim() : !faculty1 || !faculty2
    : isOther ? !otherText.trim() : !selectedFaculty;

  // ── Results View (pie chart) ──
  if (showResults) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-orange-50/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-orange-200/50 animate-in fade-in duration-300">
        <div className="mb-4">
          <span className="text-sm font-semibold text-orange-600 tracking-wider uppercase">
            Results — Question {questionIndex + 1} of {TOTAL_QUESTIONS}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight mt-2">
            {questionText}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 my-6">
          {/* Pie */}
          <div className="flex-shrink-0">
            <MiniPieChart results={pieResults} />
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 w-full">
            {pieResults.slice(0, 8).map((r, i) => (
              <div key={r.answer} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-sm font-medium text-gray-700 truncate flex-1">{r.answer}</span>
                <span className="text-sm text-gray-500 flex-shrink-0">{r.count} ({r.percentage}%)</span>
              </div>
            ))}
            {pieResults.length > 8 && (
              <div className="text-xs text-gray-400">+ {pieResults.length - 8} more</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGoNext}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg transform transition-all active:scale-95"
          >
            {questionIndex === TOTAL_QUESTIONS - 1 ? 'Finish 🎉' : 'Next Question →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Question View ──
  return (
    <div className="w-full max-w-2xl mx-auto bg-orange-50/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-orange-200/50 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-orange-600 tracking-wider uppercase">
            Question {questionIndex + 1} of {TOTAL_QUESTIONS}
          </span>
          <button
            onClick={onSkip}
            className="text-sm font-medium text-orange-400 hover:text-orange-600 transition-colors"
          >
            Skip Question
          </button>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
          {questionText}
        </h2>
      </div>

      <div className="space-y-6">
        {isDuo ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setIsOther(false)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  !isOther
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-orange-200 hover:border-orange-300'
                }`}
              >
                Select Faculty Duo
              </button>
              <button
                onClick={() => setIsOther(true)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  isOther
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-orange-200 hover:border-orange-300'
                }`}
              >
                Custom Answer
              </button>
            </div>
            {!isOther ? (
              <DuoSelector
                faculty1={faculty1}
                faculty2={faculty2}
                onChangeFaculty1={setFaculty1}
                onChangeFaculty2={setFaculty2}
              />
            ) : (
              <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Type your answer here (e.g. Dr. A & Dr. B)"
                  className="w-full p-4 rounded-xl border border-orange-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400"
                  autoFocus
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setIsOther(false)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  !isOther
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-orange-200 hover:border-orange-300'
                }`}
              >
                Select Faculty
              </button>
              <button
                onClick={() => setIsOther(true)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  isOther
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-orange-200 hover:border-orange-300'
                }`}
              >
                Custom Answer
              </button>
            </div>

            {!isOther ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <FacultySearch
                  value={selectedFaculty}
                  onChange={setSelectedFaculty}
                />
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in zoom-in duration-200">
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 rounded-xl border border-orange-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all outline-none text-gray-800 placeholder-gray-400"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}
      </div>

      {submitError && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
          {submitError}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled || isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition-all active:scale-95 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </>
          ) : (
            'Submit ✓'
          )}
        </button>
      </div>
    </div>
  );
}
