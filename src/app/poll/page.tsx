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
  const [answers, setAnswers] = useState<(VoteAnswer | DuoVoteAnswer)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentQuestionText = QUESTIONS[currentIndex];

  const handleNext = () => {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitPoll();
    }
  };

  const handleAnswer = (answerData: any) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionIndex === currentIndex);
    
    let processedAnswer: VoteAnswer | DuoVoteAnswer;
    
    if (isDuoQuestion(currentIndex)) {
      processedAnswer = {
        questionIndex: 37,
        faculty1: answerData.faculty1,
        faculty2: answerData.faculty2,
        isOther: answerData.isOther
      };
    } else {
      processedAnswer = {
        questionIndex: currentIndex,
        answer: answerData.answer,
        isOther: answerData.isOther
      };
    }

    if (existingIndex >= 0) {
      newAnswers[existingIndex] = processedAnswer;
    } else {
      newAnswers.push(processedAnswer);
    }
    
    setAnswers(newAnswers);
    handleNext();
  };

  const handleSkip = () => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionIndex === currentIndex);
    
    let skipAnswer: any;
    if (isDuoQuestion(currentIndex)) {
        skipAnswer = {
            questionIndex: 37,
            faculty1: '',
            faculty2: '',
            isOther: false
        };
    } else {
        skipAnswer = {
            questionIndex: currentIndex,
            answer: null,
            isOther: false
        } as VoteAnswer;
    }
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = skipAnswer;
    } else {
      newAnswers.push(skipAnswer);
    }
    
    setAnswers(newAnswers);
    handleNext();
  };

  const submitPoll = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.push('/');
        return;
      }

      if (result.success) {
        router.push('/success');
      } else {
        setError(result.error || 'Failed to submit vote');
      }
    } catch (err) {
      setError('An error occurred while submitting your vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAnswer = answers.find(a => a.questionIndex === currentIndex);

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Faculty Superlatives</h1>
          <span className="text-gray-500">
            Question {currentIndex + 1} of {TOTAL_QUESTIONS}
          </span>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <QuestionCard
          questionIndex={currentIndex}
          questionText={currentQuestionText}
          isDuo={isDuoQuestion(currentIndex)}
          onAnswer={handleAnswer}
          onSkip={handleSkip}
          initialAnswer={currentAnswer}
        />
        
        {isSubmitting && (
          <div className="mt-4 text-center text-gray-600">
            Submitting your votes...
          </div>
        )}
      </div>
    </div>
  );
}
