'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Clock, Award, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/types';

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [winner, setWinner] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/admin/leaderboard');
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setWinner(data.winner || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-[10px] font-bold uppercase mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Confidential Admin-Only View
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Arena Official Leaderboard</h1>
          <p className="text-slate-400 text-sm mt-1">Ranking algorithm: Highest Score ➔ Lowest Duration Tie-Breaker.</p>
        </div>

        {winner && (
          <Link
            href="/admin/winner"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 font-bold text-slate-950 text-xs flex items-center gap-2 shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span>Showcase #1 Winner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Top 3 Podiums Showcase */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Rank 2 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 text-center space-y-3 relative order-2 md:order-1 mt-0 md:mt-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center mx-auto font-mono font-black text-lg border border-slate-700">
              #2
            </div>
            <h3 className="font-extrabold text-white text-lg">{leaderboard[1].studentName}</h3>
            <p className="text-xs text-slate-400 font-mono">{leaderboard[1].studentCollegeId}</p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-purple-300">
              {leaderboard[1].score} / {leaderboard[1].totalMarks} Marks ({leaderboard[1].formattedTimeTaken})
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="glass-card p-8 rounded-3xl border border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 via-slate-950 to-slate-950 text-center space-y-4 relative order-1 md:order-2 shadow-2xl shadow-yellow-500/10 ring-1 ring-yellow-500/30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-400 text-slate-950 flex items-center justify-center mx-auto font-mono font-black text-2xl shadow-lg shadow-yellow-500/30">
              🏆 #1
            </div>
            <div>
              <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Season 1 Champion</div>
              <h3 className="font-black text-white text-2xl mt-1">{leaderboard[0].studentName}</h3>
              <p className="text-xs text-slate-400 font-mono">{leaderboard[0].studentCollegeId} • {leaderboard[0].studentEmail}</p>
            </div>
            <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-sm font-mono font-bold text-yellow-300">
              {leaderboard[0].score} / {leaderboard[0].totalMarks} Marks • {leaderboard[0].formattedTimeTaken} Time
            </div>
          </div>

          {/* Rank 3 */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 text-center space-y-3 relative order-3 md:order-3 mt-0 md:mt-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 text-amber-500 flex items-center justify-center mx-auto font-mono font-black text-lg border border-amber-800">
              #3
            </div>
            <h3 className="font-extrabold text-white text-lg">{leaderboard[2].studentName}</h3>
            <p className="text-xs text-slate-400 font-mono">{leaderboard[2].studentCollegeId}</p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-purple-300">
              {leaderboard[2].score} / {leaderboard[2].totalMarks} Marks ({leaderboard[2].formattedTimeTaken})
            </div>
          </div>

        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Candidate Name</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6">Time Taken</th>
                <th className="py-4 px-6 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Computing leaderboard rankings...
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No submissions recorded yet for leaderboard calculation.
                  </td>
                </tr>
              ) : (
                leaderboard.map(entry => (
                  <tr key={entry.id} className={`hover:bg-slate-900/50 transition-colors ${
                    entry.rank === 1 ? 'bg-yellow-500/5 font-semibold' : ''
                  }`}>
                    
                    <td className="py-4 px-6">
                      <span className={`w-8 h-8 rounded-lg font-mono font-bold text-xs inline-flex items-center justify-center ${
                        entry.rank === 1
                          ? 'bg-yellow-500 text-slate-950 font-black'
                          : entry.rank === 2
                          ? 'bg-slate-800 text-white'
                          : entry.rank === 3
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-slate-900 text-slate-400'
                      }`}>
                        #{entry.rank}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{entry.studentName}</span>
                        {entry.rank === 1 && <Trophy className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{entry.studentCollegeId} • {entry.studentEmail}</div>
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-purple-300 text-base">
                      {entry.score} <span className="text-xs text-slate-500 font-normal">/ {entry.totalMarks}</span>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{entry.formattedTimeTaken}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right text-xs text-slate-500 font-mono">
                      {new Date(entry.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
