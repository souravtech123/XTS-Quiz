'use client';

import { useState, useEffect } from 'react';
import { Trophy, Award, Clock, CheckCircle2, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/types';
import confetti from 'canvas-confetti';

export default function AdminWinnerPage() {
  const [winner, setWinner] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWinner() {
      try {
        const res = await fetch('/api/admin/leaderboard');
        const data = await res.json();
        setWinner(data.winner || null);

        if (data.winner) {
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 }
            });
          } catch (e) {}
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchWinner();
  }, []);

  if (loading) {
    return <div className="text-slate-400 font-mono text-sm">Calculating Season 1 Winner...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-2 border-b border-slate-900 pb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase">
          <Trophy className="w-4 h-4" /> Official Event Champion
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Winner Declaration</h1>
        <p className="text-slate-400 text-sm">Automated evaluation from XTS Tech Arena — Season 1 leaderboard.</p>
      </div>

      {!winner ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Winner Declared Yet</h3>
          <p className="text-xs text-slate-400">Winner will be computed automatically once students submit quiz entries.</p>
        </div>
      ) : (
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 via-slate-950 to-slate-950 shadow-2xl shadow-yellow-500/10 text-center relative overflow-hidden space-y-8">
          
          {/* Trophy Icon */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/40 transform hover:scale-105 transition-transform duration-300">
            <Trophy className="w-14 h-14" />
          </div>

          {/* Event Title */}
          <div>
            <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest">
              XTS Tech Arena — Season 1 Winner
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-2">
              {winner.studentName}
            </h2>
            <p className="text-sm text-slate-400 font-mono mt-1">
              ID: {winner.studentCollegeId} • {winner.studentEmail}
            </p>
          </div>

          {/* Winner Stats Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-center space-y-1">
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Final Score</div>
              <div className="text-3xl font-black text-white font-mono">
                {winner.score} / {winner.totalMarks}
              </div>
              <div className="text-[11px] text-yellow-300 font-mono font-semibold">{winner.percentage}% Accuracy</div>
            </div>

            <div className="p-5 rounded-2xl bg-cyan-950/60 border border-cyan-700/60 text-center space-y-1">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Time Taken</div>
              <div className="text-3xl font-black text-white font-mono">
                Time: {winner.formattedTimeTaken}
              </div>
              <div className="text-[11px] text-cyan-300 font-mono font-semibold">{winner.timeTakenSeconds} Seconds</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
            🏆 Decided by Xavier’s Tech Byte Society automated tie-breaking algorithm: <strong>Highest accuracy score (1st priority)</strong> and <strong>lowest time taken ({winner.formattedTimeTaken})</strong>.
          </div>

        </div>
      )}

    </div>
  );
}
