'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Search, ArrowUpDown, Clock, Trophy } from 'lucide-react';
import { Submission } from '@/lib/types';

export default function AdminResultsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'time'>('score');

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/admin/results');
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  // Sorting and Filtering
  const filtered = [...submissions]
    .filter(s =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCollegeId.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score') {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeTakenSeconds - b.timeTakenSeconds;
      } else {
        if (a.timeTakenSeconds !== b.timeTakenSeconds) return a.timeTakenSeconds - b.timeTakenSeconds;
        return b.score - a.score;
      }
    });

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Quiz Results & Submissions</h1>
          <p className="text-slate-400 text-sm mt-1">Audit student submissions, server scores, and completion durations.</p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase font-mono pl-2">Sort by:</span>
          <button
            onClick={() => setSortBy('score')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
              sortBy === 'score' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Score (Desc)
          </button>
          <button
            onClick={() => setSortBy('time')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
              sortBy === 'time' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Time Taken (Asc)
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter candidate by Name, Email, or Student ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6">Percentage</th>
                <th className="py-4 px-6">Time Taken</th>
                <th className="py-4 px-6 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Loading results data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No submissions recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-900/50 transition-colors">
                    
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{sub.studentName}</div>
                      <div className="text-xs text-slate-400 font-mono">{sub.studentCollegeId} • {sub.studentEmail}</div>
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-purple-300 text-base">
                      {sub.score} <span className="text-xs text-slate-500 font-normal">/ {sub.totalMarks}</span>
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-cyan-300">
                      {sub.percentage}%
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{sub.formattedTimeTaken}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right text-xs text-slate-500 font-mono">
                      {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
