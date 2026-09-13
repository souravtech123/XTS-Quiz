'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Award, CheckCircle2, Clock, Percent, ShieldCheck, Home, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentIdParam = searchParams.get('studentId');

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchResult() {
      let targetId = studentIdParam;
      if (!targetId && typeof window !== 'undefined') {
        const stored = localStorage.getItem('xts_student');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            targetId = parsed.id || parsed.studentId;
          } catch (e) {}
        }
      }

      if (!targetId) {
        setError('No student identity provided.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/result?studentId=${encodeURIComponent(targetId)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load result');
        }

        setResult(data);

        // Fire celebration confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

      } catch (err: any) {
        setError(err.message || 'Result not available');
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [studentIdParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-300 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mx-auto" />
          <p className="font-mono text-sm">Evaluating submission...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center">
        <ShieldCheck className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Result Unavailable</h2>
        <p className="text-sm text-slate-400">{error || 'No result found for this registration.'}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-3 rounded-xl bg-purple-600 font-bold text-white text-sm hover:bg-purple-500 transition-colors"
        >
          Return Home →
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative text-center">
      
      {/* Celebration Header */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold uppercase mb-6">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        Quiz Completed 🎉
      </div>

      <h1 className="text-3xl font-black text-white tracking-tight mb-1">
        {result.studentName}
      </h1>
      <p className="text-slate-400 text-xs font-mono mb-8">
        ID: {result.studentId} • {result.studentEmail}
      </p>

      {/* Primary Score Showcase Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 mb-8 space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Final Score
        </div>
        <div className="text-5xl sm:text-6xl font-black text-gradient font-mono tracking-tight">
          {result.score} <span className="text-2xl text-slate-500 font-normal">/ {result.totalMarks}</span>
        </div>
        
        <div className="inline-block px-4 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-sm font-bold font-mono">
          {result.percentage}% Accuracy
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Time Taken</div>
            <div className="text-base font-bold text-white font-mono">{result.timeTaken}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Status</div>
            <div className="text-base font-bold text-emerald-400 font-mono">{result.status}</div>
          </div>
        </div>
      </div>

      {/* Leaderboard Coming Soon Teaser Banner */}
      <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/40 border border-purple-800/50 text-left space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Leaderboard Coming Soon 🏆</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Overall student rankings and winners list will be published soon once all arena candidates complete their attempts!
        </p>
      </div>

      <button
        onClick={() => router.push('/')}
        className="w-full py-4 px-6 rounded-xl font-bold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all text-sm flex items-center justify-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Arena Home</span>
      </button>

    </div>
  );
}

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full flex-grow flex items-center justify-center">
        <Suspense fallback={<div className="text-center text-slate-400">Loading result...</div>}>
          <ResultContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

