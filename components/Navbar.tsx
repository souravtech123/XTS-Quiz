'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Trophy, Cpu, Sparkles, Menu, X, ArrowRight, Play } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-950/50 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  XTS <span className="text-gradient">TECH ARENA</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60 uppercase">
                  S1
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Xavier’s Tech Byte Society
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Home
            </Link>
            <Link href="/quiz" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" /> Give Quiz
            </Link>
            <Link href="/leaderboard" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" /> Leaderboard
              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                Soon
              </span>
            </Link>
            <Link href="/admin/login" className="text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
              Admin Login
            </Link>
          </nav>

          {/* Header Action CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/quiz"
              className="relative group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-cyan-500 shadow-md shadow-purple-900/30 hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Give Quiz</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            Home
          </Link>
          <Link
            href="/quiz"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-purple-300 hover:bg-slate-900"
          >
            Give Quiz
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-amber-300 hover:bg-slate-900"
          >
            Leaderboard (Coming Soon)
          </Link>
          <Link
            href="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-900"
          >
            Admin Dashboard
          </Link>
          <div className="pt-2">
            <Link
              href="/quiz"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 shadow-lg shadow-purple-900/30"
            >
              <span>Give Quiz Now →</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
