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

  useEffect(() => {
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

  const handleNext = () => {
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

  const isNextDisabled = isDuo
    ? isOther ? !otherText.trim() : !faculty1 || !faculty2
    : isOther ? !otherText.trim() : !selectedFaculty;

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

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition-all active:scale-95"
        >
          {questionIndex === TOTAL_QUESTIONS - 1 ? 'Finish' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
