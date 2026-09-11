'use client';

import React, { useState } from 'react';

interface PollControlProps {
  isOpen: boolean;
  onToggle: (action: 'open' | 'close') => void;
  totalVoters: number;
}

export default function PollControl({ isOpen, onToggle, totalVoters }: PollControlProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    if (isOpen) {
      setShowConfirm(true);
    } else {
      onToggle('open');
    }
  };

  const confirmClose = () => {
    setShowConfirm(false);
    onToggle('close');
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Poll Status</h2>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {isOpen && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOpen ? 'bg-green-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={`font-semibold ${isOpen ? 'text-green-600' : 'text-rose-600'}`}>
              {isOpen ? 'Open & Accepting Votes' : 'Closed'}
            </span>
          </div>
          <div className="mt-4 text-gray-500">
            <strong className="text-gray-900 text-lg">{totalVoters}</strong> total voters
          </div>
        </div>

        <div className="relative">
          {showConfirm ? (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-sm text-rose-800 font-medium mb-3">
                Are you sure? Voters will no longer be able to submit.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClose}
                  className="px-3 py-1.5 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg shadow-sm transition-colors"
                >
                  Yes, close poll
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleToggle}
              className={`px-8 py-4 rounded-2xl font-bold text-white shadow-md transition-all hover:scale-105 ${
                isOpen 
                  ? 'bg-rose-500 hover:bg-rose-600 hover:shadow-rose-500/25' 
                  : 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/25'
              }`}
            >
              {isOpen ? 'Close Poll' : 'Open Poll'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
