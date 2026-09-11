'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FACULTY } from '@/lib/constants';

interface FacultySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeValues?: string[];
  disabled?: boolean;
}

export default function FacultySearch({
  value,
  onChange,
  placeholder = 'Search faculty...',
  excludeValues = [],
  disabled = false,
}: FacultySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredFaculty = FACULTY.filter((f) =>
    f.toLowerCase().includes(query.toLowerCase()) &&
    !excludeValues.includes(f)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredFaculty.length - 1 ? prev + 1 : prev));
      if (!isOpen) setIsOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && isOpen && highlightedIndex >= 0) {
      e.preventDefault();
      onChange(filteredFaculty[highlightedIndex]);
      setIsOpen(false);
      setQuery('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {value ? (
        <div className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
          <span className="text-gray-800 font-medium truncate">{value}</span>
          {!disabled && (
            <button
              onClick={() => { onChange(''); setQuery(''); setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              aria-label="Clear selection"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>
      ) : (
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm placeholder-gray-400 text-gray-800"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>
      )}

      {isOpen && !value && !disabled && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {filteredFaculty.length > 0 ? (
            <ul className="py-2">
              {filteredFaculty.map((faculty, index) => (
                <li
                  key={faculty}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    index === highlightedIndex ? 'bg-amber-50 text-amber-900' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => {
                    onChange(faculty);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {faculty}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
}
