'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomeScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Assume valid code gives access, set it in localStorage for this session
        localStorage.setItem('voterCode', code.trim());
        router.push('/poll');
      } else {
        setError(data.error || 'Invalid code. Please try again.');
        triggerShake();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce-confetti">🎓</div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600 mb-2">
          Faculty Superlatives
        </h1>
        <p className="text-lg text-slate-600 font-medium">Civil Engineering Department</p>
      </div>

      <div className={`w-full max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl card-glow border border-amber-100 ${isShaking ? 'animate-shake' : ''}`}>
        <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-sm text-amber-800 text-center shadow-inner border border-amber-100/50">
          Vote kindly. Results show only aggregate responses.
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-2">
              Access Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your access code"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all uppercase placeholder:normal-case placeholder:text-slate-400"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 mt-2 ml-1">e.g., ABCD-EFGH</p>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={!code.trim() || isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Start Voting 🎉'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
