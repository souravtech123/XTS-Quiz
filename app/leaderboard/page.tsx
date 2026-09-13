'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Trophy, Sparkles, Clock, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function StudentLeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      <Navbar />

      <main className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full flex-grow flex items-center justify-center">
        <div className="w-full glass-card p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl relative text-center space-y-8 overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[200px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Trophy Icon Badge */}
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-500 to-purple-600 p-0.5 shadow-2xl shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Leaderboard Will Be There Soon</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Global Ranking & <span className="text-gradient">Leaderboard</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              The official XTS Tech Arena leaderboard will be unlocked soon once all participants finalize their quiz attempts.
            </p>
          </div>

          {/* How Rankings Will Work Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-4 max-w-xl mx-auto">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Ranking Criteria
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Accuracy First:</strong> Higher total score ranks higher.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Speed Tie-Breaker:</strong> If scores are equal, the student who completed in fewer seconds ranks higher.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Server Authenticated:</strong> All scores are strictly verified server-side.</span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/quiz"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-lg shadow-purple-950 hover:scale-[1.02] transition-all text-sm"
            >
              <span>Give Quiz Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all text-sm"
            >
              <span>Return Home</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
