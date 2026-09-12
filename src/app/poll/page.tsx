'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS, TOTAL_QUESTIONS } from '@/lib/constants';
import { VoteAnswer, DuoVoteAnswer } from '@/lib/types';
import { isDuoQuestion } from '@/lib/utils';
import QuestionCard from '@/components/QuestionCard';

export default function PollPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestionText = QUESTIONS[currentIndex];

  const handleAnswer = () => {
    // Vote was already submitted by QuestionCard via /api/vote-single
    // Just move to the next question or finish
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/success');
    }
  };

  const handleSkip = () => {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push('/success');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Faculty Superlatives</h1>
          <span className="text-gray-500">
            Question {currentIndex + 1} of {TOTAL_QUESTIONS}
          </span>
        </div>

        <QuestionCard
          questionIndex={currentIndex}
          questionText={currentQuestionText}
          isDuo={isDuoQuestion(currentIndex)}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}
