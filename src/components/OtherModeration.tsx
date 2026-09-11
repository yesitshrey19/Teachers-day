'use client';

import React from 'react';
import FacultySearch from './FacultySearch';

interface OtherModerationProps {
  mappings: {
    id: string;
    originalText: string;
    mappedTo: string | null;
    dismissed: boolean;
    questionIndex: number;
    questionText: string;
  }[];
  onMap: (mappingId: string, facultyName: string) => void;
  onDismiss: (mappingId: string) => void;
}

export default function OtherModeration({ mappings, onMap, onDismiss }: OtherModerationProps) {
  const pending = mappings.filter(m => !m.mappedTo && !m.dismissed);
  const resolved = mappings.filter(m => m.mappedTo || m.dismissed);

  const groupedPending = pending.reduce((acc, curr) => {
    if (!acc[curr.questionIndex]) {
      acc[curr.questionIndex] = { text: curr.questionText, items: [] };
    }
    acc[curr.questionIndex].items.push(curr);
    return acc;
  }, {} as Record<number, { text: string, items: typeof mappings }>);

  return (
    <div className="w-full space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Needs Moderation ({pending.length})</h2>
        {Object.keys(groupedPending).length === 0 ? (
          <div className="bg-green-50 text-green-700 p-8 rounded-2xl text-center border border-green-100 font-medium shadow-sm">
            All caught up! No pending submissions. 🎉
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedPending).map(([qIdx, group]) => (
              <div key={qIdx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-4">
                  Q{parseInt(qIdx) + 1}: {group.text}
                </h3>
                <div className="space-y-4">
                  {group.items.map(item => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">"{item.originalText}"</span>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="w-full md:w-64">
                          <FacultySearch
                            value=""
                            onChange={(val) => { if (val) onMap(item.id, val); }}
                            placeholder="Map to faculty..."
                          />
                        </div>
                        <button
                          onClick={() => onDismiss(item.id)}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shrink-0"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {resolved.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recently Resolved</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {resolved.slice(0, 20).map(item => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Q{item.questionIndex + 1}</span>
                    <span className="font-medium text-gray-800">"{item.originalText}"</span>
                  </div>
                  <div className="flex items-center">
                    {item.dismissed ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Dismissed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Mapped to: {item.mappedTo}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
