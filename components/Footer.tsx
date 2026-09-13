import Link from 'next/link';
import { Cpu, Terminal, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                XTS <span className="text-gradient">TECH ARENA</span>
              </span>
              <p className="text-xs text-slate-400">Powered by Xavier’s Tech Byte Society</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            Testing technical knowledge across programming, computer science fundamentals, data structures, and emerging tech concepts. Compete with top minds and claim victory.
          </p>
          <div className="flex items-center space-x-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5 text-purple-400" /> 10 Questions</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-cyan-400" /> Secure Evaluation</span>
            <span>•</span>
            <span>Season 1</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Navigation</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-cyan-400 transition-colors">Event Home</Link></li>
            <li><Link href="/register" className="hover:text-cyan-400 transition-colors">Student Registration</Link></li>
            <li><Link href="/verify" className="hover:text-cyan-400 transition-colors">Verify Eligibility</Link></li>
            <li><Link href="/quiz" className="hover:text-cyan-400 transition-colors">Quiz Portal</Link></li>
          </ul>
        </div>

        {/* Administration */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Administration</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/admin/login" className="hover:text-cyan-400 transition-colors">Admin Login</Link></li>
            <li><Link href="/admin/dashboard" className="hover:text-cyan-400 transition-colors">Admin Dashboard</Link></li>
            <li><Link href="/admin/leaderboard" className="hover:text-cyan-400 transition-colors">Admin Leaderboard</Link></li>
            <li><Link href="/admin/winner" className="hover:text-cyan-400 transition-colors">Winner Showcase</Link></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} Xavier’s Tech Byte Society (XTS). All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed for XTS Tech Arena — Season 1
        </p>
      </div>
    </footer>
  );
}
