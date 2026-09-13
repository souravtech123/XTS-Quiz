'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Trophy, 
  Play, 
  Settings, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOverview();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <div className="text-slate-400 font-mono text-sm">Loading admin dashboard...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Overview Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Arena Overview Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time participation, completion metrics, and quick arena controls.</p>
        </div>

        {/* Quick Quiz Status Switcher */}
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 pl-2 uppercase font-mono">Arena Status:</span>
          <select
            value={data?.quizStatus || 'Live'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-cyan-300 font-mono font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="Draft">Draft 📝</option>
            <option value="Published">Published 📢</option>
            <option value="Live">Live 🟢</option>
            <option value="Closed">Closed 🔴</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Registered */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</span>
            <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{data?.totalRegistered || 0}</div>
          <p className="text-xs text-slate-500">Students registered in system</p>
        </div>

        {/* Total Participants */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submissions</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{data?.totalSubmissions || 0}</div>
          <p className="text-xs text-slate-500">Completed quiz attempts</p>
        </div>

        {/* Completion Rate */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{data?.completionRate || 0}%</div>
          <p className="text-xs text-slate-500">Registered vs submitted ratio</p>
        </div>

        {/* Active Question Bank */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Bank</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{data?.totalQuestions || 0}</div>
          <p className="text-xs text-slate-500">Active test questions</p>
        </div>

      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Leaderboard & Winner Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase">
              <Trophy className="w-3.5 h-3.5" /> Admin Leaderboard & Winner
            </div>
            <h3 className="text-xl font-bold text-white">Rankings & Declaration</h3>
            <p className="text-sm text-slate-400">
              View the calculated leaderboard (highest score, lowest duration tie-breaker) and inspect the declared Season 1 winner.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/admin/leaderboard"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2"
            >
              <span>View Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/winner"
              className="px-5 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-bold text-xs flex items-center gap-2 hover:bg-yellow-500/30"
            >
              <span>Showcase Winner 🏆</span>
            </Link>
          </div>
        </div>

        {/* Quiz Management Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-xs font-bold uppercase">
              <Settings className="w-3.5 h-3.5" /> Configuration & Questions
            </div>
            <h3 className="text-xl font-bold text-white">Manage Questions & Rules</h3>
            <p className="text-sm text-slate-400">
              Add or edit quiz questions, update duration limit, configure title, and control student registration settings.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/admin/questions"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2"
            >
              <span>Edit Question Bank</span>
            </Link>
            <Link
              href="/admin/quiz-settings"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2"
            >
              <span>Quiz Settings</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
