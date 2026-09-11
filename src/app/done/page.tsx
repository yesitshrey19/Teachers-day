import Link from 'next/link';

export default function DonePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/3 left-1/3 w-36 h-36 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl card-glow border border-amber-50 max-w-lg w-full">
        <div className="text-7xl mb-6 animate-bounce-confetti">✨</div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600 mb-4">
          Thank you for voting!
        </h1>
        <p className="text-xl text-slate-600 mb-8 font-medium">
          Your responses have been recorded anonymously.
        </p>
        
        <Link 
          href="/"
          className="inline-block px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
