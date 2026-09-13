"use client"

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Trophy,
  Clock,
  Zap,
  ArrowRight,
  Target,
  Users,
  Medal,
  Brain,
  Code2,
  Network,
  Database,
  Cpu,
  CheckCircle,
  Timer,
  Flame,
  Star,
} from 'lucide-react';

/* ── Animated counter hook ───────────────────────────────────────────── */
function useCounter(end: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

/* ── Intersection observer hook ─────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Stat card with animated counter ────────────────────────────────── */
function StatCard({ value, label, suffix = '', color }: { value: number; label: string; suffix?: string; color: string }) {
  const { ref, inView } = useInView(0.3);
  const count = useCounter(value, 1600, inView);
  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className={`font-extrabold text-4xl sm:text-5xl tabular-nums ${color}`}>
        {count}{suffix}
      </span>
      <span className="text-slate-400 text-sm mt-1 font-medium">{label}</span>
    </div>
  );
}

export default function LandingPage() {
  /* floating particle positions seeded so hydration matches SSR */
  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${(i * 17 + 5) % 100}%`,
    top: `${(i * 23 + 11) % 100}%`,
    delay: `${(i * 0.3) % 3}s`,
    duration: `${4 + (i % 4)}s`,
    size: i % 3 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1',
    color: i % 2 === 0 ? 'bg-purple-500/40' : 'bg-cyan-500/40',
  }));

  const topics = [
    { icon: Brain, label: 'Algorithms & DSA', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: Network, label: 'Computer Networks', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { icon: Database, label: 'Databases & SQL', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: Cpu, label: 'Operating Systems', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Code2, label: 'Web & JS Concepts', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { icon: Target, label: 'System Design', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  ];

  const steps = [
    { n: '01', icon: Users, title: 'Register & Enter', copy: 'Register your details, verify your identity, and enter the arena.', color: 'text-purple-400', glow: 'shadow-purple-500/25' },
    { n: '02', icon: Brain, title: 'Face 10 Questions', copy: 'Ten curated technical questions spanning CS fundamentals and engineering.', color: 'text-cyan-400', glow: 'shadow-cyan-500/25' },
    { n: '03', icon: Timer, title: 'Beat the Clock', copy: 'You have exactly 10 minutes. Every second you save counts toward your rank.', color: 'text-amber-400', glow: 'shadow-amber-500/25' },
    { n: '04', icon: Trophy, title: 'Claim Your Rank', copy: 'Instant server-verified scoring. See where you stand on the leaderboard.', color: 'text-emerald-400', glow: 'shadow-emerald-500/25' },
  ];

  const rules = [
    { text: 'Open to all students — any year, any branch.', highlight: 'Open entry.' },
    { text: 'Every competitor gets the same 10 questions under an identical 10-minute clock.', highlight: 'Fixed conditions.' },
    { text: 'Score is decided first. Time breaks all ties — faster wins.', highlight: 'Accuracy then speed.' },
    { text: 'No re-attempts, no pausing the timer once started.', highlight: 'One shot.' },
    { text: 'Scoring is done on the server — answers cannot be tampered with.', highlight: 'Verified results.' },
  ];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col overflow-hidden">
      <Navbar />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative pt-20 pb-32 md:pt-28 md:pb-40 overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-mesh-gradient pointer-events-none" />

        {/* Glowing orbs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none" />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <span
            key={i}
            className={`absolute rounded-full ${p.size} ${p.color} animate-float pointer-events-none`}
            style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration }}
          />
        ))}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-700/40 text-purple-300 text-sm font-semibold mb-8 backdrop-blur-sm">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            Presented by Xavier&rsquo;s Tech Byte Society &nbsp;·&nbsp; Season 1
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="font-black text-[3.25rem] sm:text-7xl md:text-8xl leading-[0.95] tracking-tight mb-6">
            <span className="block text-white">XTS</span>
            <span className="block text-gradient">TECH ARENA</span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-4 leading-relaxed">
            One arena. 10 questions. 20 minutes.{' '}
            <span className="text-cyan-400 font-bold">Are you the fastest mind</span> in the room?
          </p>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto mb-12">
            A single-round, server-verified technical quiz — no retakes, no excuses.
            Prove your fundamentals. Dominate the leaderboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/quiz"
              className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-xl shadow-purple-900/40 hover:shadow-cyan-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="w-5 h-5 group-hover:animate-bounce" />
              Enter the Arena
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base text-slate-300 border border-slate-700 hover:border-purple-500/60 hover:text-white hover:bg-slate-900/60 backdrop-blur-sm transition-all duration-200"
            >
              How it works
            </Link>
          </div>

          {/* Live stat strip */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-8 py-4 rounded-2xl glass-card mx-auto">
            <StatCard value={10} label="Questions" suffix="" color="text-purple-400" />
            <div className="w-px h-10 bg-slate-700/60 hidden sm:block" />
            <StatCard value={10} label="Minutes" suffix="" color="text-cyan-400" />
            <div className="w-px h-10 bg-slate-700/60 hidden sm:block" />
            <StatCard value={1} label="Winner" suffix="" color="text-amber-400" />
            <div className="w-px h-10 bg-slate-700/60 hidden sm:block" />
            <StatCard value={100} label="Server-Verified" suffix="%" color="text-emerald-400" />
          </div>
        </div>
      </section>

      {/* ═══════════════════ TOPICS ═══════════════════ */}
      <section className="relative py-24 border-t border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.04)_0%,_transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-purple-400 mb-3 block">What&apos;s Tested</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Six Domains.{' '}
              <span className="text-gradient">Zero Mercy.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Questions are drawn from the core pillars of computer science and software engineering — the same knowledge that powers real interviews.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {topics.map(({ icon: Icon, label, color, bg }) => (
              <div
                key={label}
                className={`glass-card glass-card-hover flex flex-col items-center gap-3 p-5 rounded-2xl border ${bg} cursor-default`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} border`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-xs font-semibold text-center text-slate-300 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" className="relative py-24 border-t border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,_rgba(6,182,212,0.05)_0%,_transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-400 mb-3 block">The Flow</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Four Steps to{' '}
              <span className="text-gradient">Victory</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              From registration to rank — straight through, no breaks. Come prepared.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-[52px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-emerald-500/30" />

            {steps.map((step) => (
              <div key={step.n} className={`glass-card glass-card-hover rounded-2xl p-6 border border-slate-800/60 shadow-lg ${step.glow} flex flex-col gap-4`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl glass-card border border-slate-700 flex items-center justify-center shrink-0`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <span className={`font-mono text-2xl font-black ${step.color} opacity-40`}>{step.n}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ RULES & SCORING ═══════════════════ */}
      <section id="rules" className="relative py-24 border-t border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_rgba(139,92,246,0.06)_0%,_transparent_70%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Rules list */}
            <div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-purple-400 mb-3 block">Competition Rules</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-8 leading-tight">
                The laws of<br />
                <span className="text-gradient">the arena</span>
              </h2>
              <ul className="space-y-5">
                {rules.map(({ text, highlight }, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:bg-purple-500/30 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-slate-300 leading-relaxed">
                      <strong className="text-white font-bold">{highlight} </strong>
                      {text.replace(highlight, '').trim()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scoring card */}
            <div className="glass-card rounded-2xl border border-slate-800/60 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-800/60 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Ranking Algorithm</h3>
                  <p className="text-xs text-slate-400">How the leaderboard is decided</p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex gap-4 items-start">
                  <span className="font-mono text-amber-400 font-black text-xl shrink-0">01</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Score is king</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">More correct answers → higher rank. Every right answer is 1 mark.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="font-mono text-cyan-400 font-black text-xl shrink-0">02</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Speed breaks ties</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Equal score? The faster completion time takes the higher rank.</p>
                  </div>
                </div>

                {/* Live example table */}
                <div className="rounded-xl overflow-hidden border border-slate-700/50">
                  <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-700/50">
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Tiebreaker example</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 border-b border-slate-800">
                        <th className="px-4 py-2.5 text-left font-medium">Competitor</th>
                        <th className="px-4 py-2.5 text-left font-medium">Score</th>
                        <th className="px-4 py-2.5 text-left font-medium">Time</th>
                        <th className="px-4 py-2.5 text-right font-medium">Rank</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      <tr className="border-b border-slate-800/50 bg-amber-500/5">
                        <td className="px-4 py-3 text-white">Student A</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold">10/10</td>
                        <td className="px-4 py-3 text-slate-300">7:04</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                            <Trophy className="w-3.5 h-3.5" /> #1
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="px-4 py-3 text-white">Student B</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold">10/10</td>
                        <td className="px-4 py-3 text-slate-400">8:21</td>
                        <td className="px-4 py-3 text-right text-slate-400">#2</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-white">Student C</td>
                        <td className="px-4 py-3 text-slate-300">9/10</td>
                        <td className="px-4 py-3 text-slate-400">5:55</td>
                        <td className="px-4 py-3 text-right text-slate-400">#3</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ MOTIVATIONAL TICKER ═══════════════════ */}
      <section className="py-8 border-t border-b border-slate-800/60 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-cyan-500/5 to-purple-600/5" />
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, gi) => (
            <span key={gi} className="flex items-center gap-6">
              {['10 Questions', '10 Minutes', '1 Champion', 'Prove Your Skills', 'Server Verified', 'No Retakes', 'Beat the Clock', 'Rise in the Arena'].map((t, i) => (
                <span key={i} className="flex items-center gap-3 px-6">
                  <Star className="w-4 h-4 text-purple-400/60 shrink-0" />
                  <span className="text-slate-400 text-sm font-semibold tracking-wide uppercase">{t}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CLOSING CTA ═══════════════════ */}
      <section className="relative py-32 border-t border-slate-800/60 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-purple-600/8 blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 text-sm font-semibold mb-8">
            <Medal className="w-4 h-4 text-emerald-400" />
            Registrations are open to all students
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            The arena{' '}
            <span className="text-gradient">awaits</span>
            <br />your entry
          </h2>
          <p className="text-slate-400 text-lg sm:text-xl max-w-lg mx-auto mb-12 leading-relaxed">
            Ten questions. Ten minutes. One attempt. Your fundamentals, your speed, your victory — all decided right now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href="/quiz"
              className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-xl text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 shadow-2xl shadow-purple-900/50 hover:shadow-cyan-500/30 hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <Zap className="w-6 h-6 group-hover:animate-bounce" />
              Enter the Arena
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-8 py-5 rounded-2xl font-semibold text-base text-amber-300 border border-amber-700/40 hover:border-amber-500/60 hover:bg-amber-950/30 transition-all duration-200"
            >
              <Trophy className="w-5 h-5" />
              View Leaderboard
            </Link>
          </div>

          {/* Quick stats pill */}
          <div className="mt-12 inline-flex items-center gap-4 px-6 py-3 rounded-full glass-card text-sm text-slate-400 border border-slate-800">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-400" /> 10 min quiz</span>
            <span className="w-px h-4 bg-slate-700" />
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Instant results</span>
            <span className="w-px h-4 bg-slate-700" />
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-cyan-400" /> Free to enter</span>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}