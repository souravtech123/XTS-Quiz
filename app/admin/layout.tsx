'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  Settings, 
  BarChart3, 
  Trophy, 
  Award, 
  LogOut, 
  Cpu, 
  ShieldCheck, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Skip auth check if on /admin/login
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(true);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/admin');
        const data = await res.json();
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setAuthenticated(true);
        }
      } catch (err) {
        router.push('/admin/login');
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (e) {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-300 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mx-auto" />
          <p className="font-mono text-sm">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Student Management', href: '/admin/students', icon: Users },
    { label: 'Question Bank', href: '/admin/questions', icon: HelpCircle },
    { label: 'Quiz Settings', href: '/admin/quiz-settings', icon: Settings },
    { label: 'Submissions & Results', href: '/admin/results', icon: BarChart3 },
    { label: 'Leaderboard (Admin Only)', href: '/admin/leaderboard', icon: Trophy, badge: 'Admin' },
    { label: 'Winner Showcase', href: '/admin/winner', icon: Award, highlight: true }
  ];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-white text-sm">XTS Admin Panel</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between p-4 transition-all duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="space-y-6">
          
          {/* Admin Header */}
          <div className="px-2 pt-2">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight">
                  XTS <span className="text-gradient">ADMIN</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono">Tech Arena — Season 1</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-purple-950/80 border border-purple-500/50 text-white font-bold shadow-lg shadow-purple-950/50'
                      : item.highlight
                      ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-yellow-400' : 'text-slate-500'}`} />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-300 uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-slate-900 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              View Student Site
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-950/40 border border-red-900/40 text-xs font-semibold text-red-300 hover:bg-red-900/60 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout Admin</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">
        {children}
      </div>

    </div>
  );
}
