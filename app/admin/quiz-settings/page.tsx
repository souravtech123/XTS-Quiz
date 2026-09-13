'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { QuizConfig, QuizStatus } from '@/lib/types';

export default function AdminQuizSettingsPage() {
  const [config, setConfig] = useState<QuizConfig>({
    title: 'XTS Tech Arena — Season 1',
    subtitle: 'Test your technical knowledge. Challenge yourself. Compete with the best.',
    totalQuestions: 10,
    timeLimitMinutes: 10,
    status: 'Live',
    requireStudentId: true,
    requirePhone: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/admin/config');
        const data = await res.json();
        if (data.config) setConfig(data.config);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save configuration');

      setMessage('Configuration updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-400 font-mono text-sm">Loading quiz configuration...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="border-b border-slate-900 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Quiz Configuration</h1>
        <p className="text-slate-400 text-sm mt-1">Configure event metadata, time duration limits, and arena status.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
        
        {/* Quiz Title & Subtitle */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Quiz Event Title</label>
            <input
              type="text"
              value={config.title}
              onChange={e => setConfig({ ...config, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Event Subtitle / Tagline</label>
            <input
              type="text"
              value={config.subtitle}
              onChange={e => setConfig({ ...config, subtitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
            />
          </div>
        </div>

        {/* Status & Time Limit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-900">
          
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
              Arena Status
            </label>
            <select
              value={config.status}
              onChange={e => setConfig({ ...config, status: e.target.value as QuizStatus })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold text-cyan-300 font-mono"
            >
              <option value="Draft">Draft (Only Admins can preview)</option>
              <option value="Published">Published (Upcoming / View Rules)</option>
              <option value="Live">Live (Open for Student Attempts 🟢)</option>
              <option value="Closed">Closed (Submissions Locked 🔴)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
              Time Limit (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={180}
              value={config.timeLimitMinutes}
              onChange={e => setConfig({ ...config, timeLimitMinutes: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold font-mono text-white"
            />
          </div>

        </div>

        {/* Form Requirements Toggles */}
        <div className="space-y-3 pt-4 border-t border-slate-900">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Registration Form Requirements</h3>
          
          <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.requireStudentId}
              onChange={e => setConfig({ ...config, requireStudentId: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0"
            />
            <span>Require Student ID / College Roll No during registration</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.requirePhone}
              onChange={e => setConfig({ ...config, requirePhone: e.target.checked })}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-0"
            />
            <span>Require Phone Number during registration</span>
          </label>
        </div>

        {/* Save CTA */}
        <div className="pt-4 border-t border-slate-900">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:shadow-cyan-500/20 text-xs flex items-center gap-2 shadow-lg shadow-purple-950 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
