'use client';

import React, { useState } from 'react';
import FacultySearch from './FacultySearch';

interface DuoSelectorProps {
  faculty1: string;
  faculty2: string;
  onChangeFaculty1: (value: string) => void;
  onChangeFaculty2: (value: string) => void;
  disabled?: boolean;
}

export default function DuoSelector({
  faculty1,
  faculty2,
  onChangeFaculty1,
  onChangeFaculty2,
  disabled = false,
}: DuoSelectorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFaculty1Change = (val: string) => {
    if (val === faculty2 && val !== '') {
      setError('Cannot pick the same person twice');
      return;
    }
    setError(null);
    onChangeFaculty1(val);
  };

  const handleFaculty2Change = (val: string) => {
    if (val === faculty1 && val !== '') {
      setError('Cannot pick the same person twice');
      return;
    }
    setError(null);
    onChangeFaculty2(val);
  };

  return (
    <div className="w-full bg-amber-50/30 p-6 rounded-2xl border border-amber-100 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <div className="flex-1 w-full flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">First pick</label>
          <FacultySearch
            value={faculty1}
            onChange={handleFaculty1Change}
            excludeValues={faculty2 ? [faculty2] : []}
            disabled={disabled}
            placeholder="Search first person..."
          />
        </div>
        
        <div className="flex items-center justify-center pt-6 sm:pt-6">
          <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-500 font-bold text-xl border border-amber-100">
            &
          </div>
        </div>
        
        <div className="flex-1 w-full flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">Second pick</label>
          <FacultySearch
            value={faculty2}
            onChange={handleFaculty2Change}
            excludeValues={faculty1 ? [faculty1] : []}
            disabled={disabled}
            placeholder="Search second person..."
          />
        </div>
      </div>
      {error && (
        <div className="text-red-500 text-sm font-medium text-center animate-in fade-in zoom-in duration-200">
          {error}
        </div>
      )}
    </div>
  );
}
