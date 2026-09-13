'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Trash2, Edit3, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { Question } from '@/lib/types';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    story: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A' as 'A' | 'B' | 'C' | 'D',
    marks: 5
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/questions');
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      story: '',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 5
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (q: Question) => {
    setEditingId(q.id);
    setForm({
      story: q.story || '',
      question: q.question,
      optionA: q.options.A,
      optionB: q.options.B,
      optionC: q.options.C,
      optionD: q.options.D,
      correctAnswer: q.correctAnswer,
      marks: q.marks || 5
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      story: form.story,
      question: form.question,
      options: {
        A: form.optionA,
        B: form.optionB,
        C: form.optionC,
        D: form.optionD
      },
      correctAnswer: form.correctAnswer,
      marks: form.marks
    };

    try {
      let res;
      if (editingId) {
        res = await fetch('/api/admin/questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        });
      } else {
        res = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save question');

      setShowModal(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Error saving question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await fetch(`/api/admin/questions?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      fetchQuestions();
    } catch (e) {
      alert('Failed to delete question');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Question Bank Management</h1>
          <p className="text-slate-400 text-sm mt-1">Configure questions, answer options, and scoring marks.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs flex items-center gap-2 shadow-lg shadow-purple-950"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-slate-400 text-xs font-mono">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Questions Found</h3>
          <p className="text-xs text-slate-400">Click "Add Question" to start building your quiz bank.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    Q{idx + 1}
                  </span>
                  <div>
                    {q.story && (
                      <div className="mb-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-400 font-mono italic">
                        {q.story.substring(0, 100)}{q.story.length > 100 ? '...' : ''}
                      </div>
                    )}
                    <h3 className="font-bold text-white text-base">{q.question}</h3>
                    <span className="text-[11px] font-mono text-slate-500">Marks: {q.marks}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                    title="Edit Question"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-2 rounded-lg bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/60"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2">
                {(['A', 'B', 'C', 'D'] as const).map(key => {
                  const isCorrect = q.correctAnswer === key;
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        isCorrect
                          ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="break-words"><strong>{key}:</strong> {q.options[key]}</span>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">
              {editingId ? 'Edit Question' : 'Add New Question'}
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-red-950 text-red-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Case Study / Story (Optional)</label>
                <textarea
                  rows={4}
                  value={form.story}
                  onChange={e => setForm({ ...form, story: e.target.value })}
                  placeholder="e.g. A long case study or scenario..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Question Statement</label>
                <textarea
                  required
                  rows={2}
                  value={form.question}
                  onChange={e => setForm({ ...form, question: e.target.value })}
                  placeholder="e.g. Based on the case above, what is..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Option A</label>
                  <textarea
                    required
                    rows={2}
                    value={form.optionA}
                    onChange={e => setForm({ ...form, optionA: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Option B</label>
                  <textarea
                    required
                    rows={2}
                    value={form.optionB}
                    onChange={e => setForm({ ...form, optionB: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Option C</label>
                  <textarea
                    required
                    rows={2}
                    value={form.optionC}
                    onChange={e => setForm({ ...form, optionC: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Option D</label>
                  <textarea
                    required
                    rows={2}
                    value={form.optionD}
                    onChange={e => setForm({ ...form, optionD: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Correct Answer</label>
                  <select
                    value={form.correctAnswer}
                    onChange={e => setForm({ ...form, correctAnswer: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-bold font-mono"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    value={form.marks}
                    onChange={e => setForm({ ...form, marks: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 font-bold text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-purple-600 font-bold text-white text-xs hover:bg-purple-500"
                >
                  {submitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
